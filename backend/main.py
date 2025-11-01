from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from contextlib import asynccontextmanager
from datetime import datetime
from nanoid import generate
import logging
import asyncio
from pydantic import BaseModel
from typing import Optional, Dict, Any

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
    ARConfigModel,
)
from lib.ai_providers import create_provider

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

        # Use projection to reduce data transfer - exclude large fields if not needed
        projection = {
            "_id": 1,
            "item_id": 1,
            "name": 1,
            "type": 1,
            "description": 1,
            "price": 1,
            "images": 1,
            "status": 1,
            "created_at": 1
        }

        # Get items with projection and count in parallel
        cursor = db.jewelry_items.find(query, projection).skip(skip).limit(page_size).sort("created_at", -1)
        
        # Always use count_documents for accurate counts
        items, total_count = await asyncio.gather(
            cursor.to_list(length=page_size),
            db.jewelry_items.count_documents(query)
        )

        # Convert ObjectId to string efficiently
        for item in items:
            item["_id"] = str(item["_id"])

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


# Factory functions for default values to avoid redundant object creation
def get_default_ar_config() -> dict:
    """Get default AR configuration"""
    return ARConfigModel().dict()


def get_default_stock() -> dict:
    """Get default stock configuration"""
    return {"available": True, "quantity": 0, "low_stock_threshold": 3}


# Cache default configs at module level for better performance
_DEFAULT_AR_CONFIG = None
_DEFAULT_STOCK = None


@app.post(f"{settings.API_PREFIX}/jewelry", status_code=status.HTTP_201_CREATED)
async def create_jewelry(
    item: JewelryItemCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Create new jewelry item"""
    try:
        global _DEFAULT_AR_CONFIG, _DEFAULT_STOCK
        
        # Lazy initialize defaults
        if _DEFAULT_AR_CONFIG is None:
            _DEFAULT_AR_CONFIG = get_default_ar_config()
        if _DEFAULT_STOCK is None:
            _DEFAULT_STOCK = get_default_stock()
        
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
            "ar_config": item.ar_config.dict() if item.ar_config else _DEFAULT_AR_CONFIG,
            "metadata": item.metadata.dict() if item.metadata else {},
            "stock": item.stock.dict() if item.stock else _DEFAULT_STOCK,
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
        # Prepare update data with exclude_unset to avoid updating unchanged fields
        update_data = item.dict(exclude_unset=True)
        if not update_data:
            # Return success for no-op updates to maintain backwards compatibility
            existing = await db.jewelry_items.find_one({"item_id": item_id})
            if not existing:
                raise HTTPException(status_code=404, detail="Jewelry item not found")
            existing["_id"] = str(existing["_id"])
            return {
                "success": True,
                "message": "No changes to update",
                "item": existing,
            }
            
        update_data["updated_at"] = datetime.utcnow()

        # Use find_one_and_update to check existence and update in single operation
        updated_item = await db.jewelry_items.find_one_and_update(
            {"item_id": item_id},
            {"$set": update_data},
            return_document=True  # Return updated document
        )

        if not updated_item:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

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
        # Use projection to only fetch needed fields
        item_projection = {"item_id": 1, "name": 1, "analytics": 1}
        event_projection = {"_id": 1, "event_type": 1, "timestamp": 1, "session_id": 1}
        
        # Fetch item and events in parallel
        item, events = await asyncio.gather(
            db.jewelry_items.find_one({"item_id": item_id}, item_projection),
            db.analytics_events.find({"jewelry_id": item_id}, event_projection)
                .sort("timestamp", -1)
                .limit(100)
                .to_list(length=100)
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        # Convert ObjectId to string efficiently
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
        # Optimize aggregation pipeline with indexed match first
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

        # Use projection to reduce data in top_items query
        top_items_projection = {
            "item_id": 1,
            "name": 1,
            "type": 1,
            "price": 1,
            "analytics": 1,
            "images.thumbnail": 1
        }

        # Run aggregation and top items query in parallel
        result, top_items = await asyncio.gather(
            db.jewelry_items.aggregate(pipeline).to_list(length=1),
            db.jewelry_items.find(
                {"status": "active"}, top_items_projection
            ).sort("analytics.try_ons", -1).limit(5).to_list(length=5)
        )
        
        summary = result[0] if result else {}

        # Calculate conversion rate
        try_ons = summary.get("total_try_ons", 0)
        conversions = summary.get("total_conversions", 0)
        conversion_rate = (conversions / try_ons * 100) if try_ons > 0 else 0

        # Convert ObjectId to string efficiently
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


# ==============================================
# AI Try-On Endpoint
# ==============================================

class TryOnRequest(BaseModel):
    """Try-on request model"""
    user_photo: str  # Base64 or URL
    jewelry_id: str
    options: Optional[Dict[str, Any]] = {}


@app.post(f"{settings.API_PREFIX}/tryon")
async def ai_tryon(
    request: TryOnRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """AI-powered jewelry try-on using image generation"""
    try:
        # Get jewelry item
        jewelry = await db.jewelry_items.find_one({"item_id": request.jewelry_id})
        if not jewelry:
            raise HTTPException(status_code=404, detail="Jewelry item not found")

        # Prepare jewelry data for AI
        jewelry_data = {
            "type": jewelry.get("type", "ring"),
            "name": jewelry.get("name", ""),
            "metal": jewelry.get("metadata", {}).get("metal", "gold"),
            "stone": jewelry.get("metadata", {}).get("stone", ""),
            "style": jewelry.get("metadata", {}).get("style", "elegant"),
        }

        # Get AI provider from settings
        provider_name = settings.AI_PROVIDER
        provider_config = {
            "api_key": settings.FAL_API_KEY if provider_name == "fal" else settings.REPLICATE_API_TOKEN,
            "model": settings.FAL_MODEL if provider_name == "fal" else "black-forest-labs/flux-1.1-pro",
        }

        # Create provider
        provider = create_provider(provider_name, provider_config)

        logger.info(f"Using AI provider: {provider.name} for jewelry: {request.jewelry_id}")

        # Process image
        result = await provider.place_jewelry(
            user_photo=request.user_photo,
            jewelry_data=jewelry_data,
            options=request.options
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"AI processing failed: {result.get('error', 'Unknown error')}"
            )

        # Track try-on analytics
        await db.jewelry_items.update_one(
            {"item_id": request.jewelry_id},
            {"$inc": {"analytics.try_ons": 1}}
        )

        logger.info(f"Try-on successful. Cost: ${result.get('cost', 0)}")

        return {
            "success": True,
            "image_url": result["image_url"],
            "metadata": result.get("metadata", {}),
            "cost": result.get("cost", 0),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI try-on: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=settings.DEBUG)
