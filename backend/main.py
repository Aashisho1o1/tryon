from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from datetime import datetime
from nanoid import generate
import logging

from config import settings
from database import MongoDB, get_database
from models import (
    JewelryItemCreate,
    JewelryItemUpdate,
    AnalyticsEventCreate,
    EventType,
    JewelryStatus,
    SuccessResponse,
    ErrorResponse,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    await MongoDB.connect_db()
    logger.info("Application started")
    yield
    # Shutdown
    await MongoDB.close_db()
    logger.info("Application shutdown")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Virtual jewelry try-on API with AR capabilities",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================
# Utility Functions
# ==============================================

def generate_short_code() -> str:
    """Generate short unique code for shareable links"""
    return generate(size=8)


def create_share_link(short_code: str) -> dict:
    """Create share link dictionary"""
    return {
        "short_code": short_code,
        "full_url": f"https://yoursite.com/try-on/{short_code}",
        "qr_code": f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://yoursite.com/try-on/{short_code}",
    }


# ==============================================
# Root Endpoints
# ==============================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Jewelry AR Try-On API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "jewelry": f"{settings.API_PREFIX}/jewelry",
            "analytics": f"{settings.API_PREFIX}/analytics",
            "health": "/health",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
    }


# ==============================================
# Jewelry Endpoints
# ==============================================

@app.get(f"{settings.API_PREFIX}/jewelry")
async def get_all_jewelry(
    page: int = 1,
    page_size: int = 20,
    type: str = None,
    status: str = "active",
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get all jewelry items with pagination"""
    try:
        # Build query
        query = {"status": status} if status else {}
        if type:
            query["type"] = type

        # Calculate skip
        skip = (page - 1) * page_size

        # Get items
        cursor = db.jewelry_items.find(query).skip(skip).limit(page_size).sort("created_at", -1)
        items = await cursor.to_list(length=page_size)

        # Convert ObjectId to string
        for item in items:
            item["_id"] = str(item["_id"])

        # Get total count
        total_count = await db.jewelry_items.count_documents(query)
        total_pages = (total_count + page_size - 1) // page_size

        return {
            "success": True,
            "items": items,
            "count": len(items),
            "page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
        }
    except Exception as e:
        logger.error(f"Error fetching jewelry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(f"{settings.API_PREFIX}/jewelry/{{item_id}}")
async def get_jewelry_by_id(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get single jewelry item by ID"""
    try:
        item = await db.jewelry_items.find_one({"item_id": item_id})

        if not item:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        item["_id"] = str(item["_id"])

        # Track view
        await db.jewelry_items.update_one(
            {"item_id": item_id}, {"$inc": {"analytics.views": 1}}
        )

        return {"success": True, "item": item}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching jewelry by ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post(f"{settings.API_PREFIX}/jewelry", status_code=status.HTTP_201_CREATED)
async def create_jewelry(
    item: JewelryItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Create new jewelry item"""
    try:
        # Generate unique ID and share link
        item_id = generate_short_code()
        share_link = create_share_link(item_id)

        # Prepare document
        now = datetime.utcnow()
        jewelry_doc = {
            "item_id": item_id,
            "name": item.name,
            "type": item.type,
            "description": item.description,
            "price": item.price.dict(),
            "images": {"thumbnail": None, "main": None, "gallery": []},
            "ar_config": item.ar_config.dict() if item.ar_config else ARConfigModel().dict(),
            "metadata": item.metadata.dict() if item.metadata else {},
            "stock": item.stock.dict() if item.stock else {"available": True, "quantity": 0, "low_stock_threshold": 3},
            "share_link": share_link,
            "analytics": {
                "views": 0,
                "try_ons": 0,
                "shares": 0,
                "conversions": 0,
                "revenue_generated": 0.0,
            },
            "seo": {
                "meta_title": f"{item.name} - Virtual Try-On",
                "meta_description": item.description[:160] if item.description else "",
                "keywords": [],
            },
            "created_at": now,
            "updated_at": now,
            "status": "active",
        }

        # Insert to database
        result = await db.jewelry_items.insert_one(jewelry_doc)
        jewelry_doc["_id"] = str(result.inserted_id)

        return {
            "success": True,
            "message": "Jewelry item created successfully",
            "item": jewelry_doc,
        }
    except Exception as e:
        logger.error(f"Error creating jewelry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put(f"{settings.API_PREFIX}/jewelry/{{item_id}}")
async def update_jewelry(
    item_id: str,
    item: JewelryItemUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Update jewelry item"""
    try:
        # Check if item exists
        existing = await db.jewelry_items.find_one({"item_id": item_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        # Prepare update data
        update_data = {k: v for k, v in item.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.utcnow()

        # Update in database
        await db.jewelry_items.update_one(
            {"item_id": item_id}, {"$set": update_data}
        )

        # Get updated item
        updated_item = await db.jewelry_items.find_one({"item_id": item_id})
        updated_item["_id"] = str(updated_item["_id"])

        return {
            "success": True,
            "message": "Jewelry item updated successfully",
            "item": updated_item,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating jewelry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete(f"{settings.API_PREFIX}/jewelry/{{item_id}}")
async def delete_jewelry(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Delete jewelry item (soft delete)"""
    try:
        result = await db.jewelry_items.update_one(
            {"item_id": item_id},
            {"$set": {"status": "archived", "updated_at": datetime.utcnow()}},
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        return {"success": True, "message": "Jewelry item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting jewelry: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================
# Analytics Endpoints
# ==============================================

@app.post(f"{settings.API_PREFIX}/analytics")
async def track_event(
    event: AnalyticsEventCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Track analytics event"""
    try:
        # Generate event ID
        event_id = generate(size=16)

        # Prepare event document
        event_doc = {
            "event_id": event_id,
            "jewelry_id": event.jewelry_id,
            "event_type": event.event_type,
            "timestamp": datetime.utcnow(),
            "session_id": event.session_id,
            "user_data": event.user_data.dict() if event.user_data else {},
            "source": event.source.dict() if event.source else {},
            "duration_seconds": event.duration_seconds,
            "interactions": event.interactions.dict() if event.interactions else {},
        }

        # Insert event
        await db.analytics_events.insert_one(event_doc)

        # Update item analytics
        update_field = f"analytics.{event.event_type}s"
        await db.jewelry_items.update_one(
            {"item_id": event.jewelry_id}, {"$inc": {update_field: 1}}
        )

        return {"success": True, "message": "Event tracked successfully"}
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(f"{settings.API_PREFIX}/analytics/{{item_id}}")
async def get_item_analytics(
    item_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get analytics for specific jewelry item"""
    try:
        # Get item
        item = await db.jewelry_items.find_one({"item_id": item_id})
        if not item:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        # Get events
        cursor = db.analytics_events.find({"jewelry_id": item_id}).sort("timestamp", -1).limit(100)
        events = await cursor.to_list(length=100)

        for event in events:
            event["_id"] = str(event["_id"])

        return {
            "success": True,
            "item_id": item_id,
            "item_name": item["name"],
            "stats": item.get("analytics", {}),
            "recent_events": events,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(f"{settings.API_PREFIX}/analytics")
async def get_overall_analytics(
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Get overall analytics summary"""
    try:
        # Aggregate analytics
        pipeline = [
            {"$match": {"status": "active"}},
            {
                "$group": {
                    "_id": None,
                    "total_items": {"$sum": 1},
                    "total_views": {"$sum": "$analytics.views"},
                    "total_try_ons": {"$sum": "$analytics.try_ons"},
                    "total_shares": {"$sum": "$analytics.shares"},
                    "total_conversions": {"$sum": "$analytics.conversions"},
                    "total_revenue": {"$sum": "$analytics.revenue_generated"},
                }
            },
        ]

        result = await db.jewelry_items.aggregate(pipeline).to_list(length=1)
        summary = result[0] if result else {}

        # Calculate conversion rate
        try_ons = summary.get("total_try_ons", 0)
        conversions = summary.get("total_conversions", 0)
        conversion_rate = (conversions / try_ons * 100) if try_ons > 0 else 0

        # Get top items
        top_items = await db.jewelry_items.find(
            {"status": "active"}
        ).sort("analytics.try_ons", -1).limit(5).to_list(length=5)

        for item in top_items:
            item["_id"] = str(item["_id"])

        return {
            "success": True,
            "summary": {
                "total_items": summary.get("total_items", 0),
                "total_views": summary.get("total_views", 0),
                "total_try_ons": summary.get("total_try_ons", 0),
                "total_shares": summary.get("total_shares", 0),
                "total_conversions": summary.get("total_conversions", 0),
                "total_revenue": summary.get("total_revenue", 0),
                "conversion_rate": round(conversion_rate, 2),
            },
            "top_items": top_items,
        }
    except Exception as e:
        logger.error(f"Error fetching overall analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=settings.DEBUG)
