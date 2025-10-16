from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class JewelryType(str, Enum):
    """Jewelry types"""
    EARRINGS = "earrings"
    NECKLACE = "necklace"
    RING = "ring"
    BRACELET = "bracelet"


class JewelryStatus(str, Enum):
    """Jewelry item status"""
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class EventType(str, Enum):
    """Analytics event types"""
    VIEW = "view"
    TRY_ON = "try_on"
    SHARE = "share"
    CLICK = "click"
    PURCHASE = "purchase"


# ==============================================
# Jewelry Models
# ==============================================

class PriceModel(BaseModel):
    """Price information"""
    amount: float = Field(..., ge=0)
    currency: str = "NPR"
    discount: Optional[float] = Field(None, ge=0, le=100)


class ImagesModel(BaseModel):
    """Image URLs"""
    thumbnail: Optional[str] = None
    main: Optional[str] = None
    gallery: List[str] = []


class ARConfigModel(BaseModel):
    """AR rendering configuration"""
    color: str = "#FFD700"
    size: int = Field(30, ge=10, le=100)
    position_offset: Dict[str, int] = {"x": 0, "y": 0}
    landmarks: List[int] = [234, 454]  # MediaPipe landmarks
    render_type: str = "circle"  # circle, image, 3d_model


class MetadataModel(BaseModel):
    """Jewelry metadata"""
    material: Optional[str] = None
    weight: Optional[str] = None
    tags: List[str] = []
    category: Optional[str] = None
    subcategory: Optional[str] = None


class StockModel(BaseModel):
    """Stock information"""
    available: bool = True
    quantity: int = Field(0, ge=0)
    low_stock_threshold: int = 3


class ShareLinkModel(BaseModel):
    """Share link information"""
    short_code: str
    full_url: str
    qr_code: Optional[str] = None


class AnalyticsModel(BaseModel):
    """Item analytics summary"""
    views: int = 0
    try_ons: int = 0
    shares: int = 0
    conversions: int = 0
    revenue_generated: float = 0.0


class SEOModel(BaseModel):
    """SEO metadata"""
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: List[str] = []


class JewelryItem(BaseModel):
    """Complete jewelry item model"""
    item_id: str
    name: str
    type: JewelryType
    description: Optional[str] = None
    price: PriceModel
    images: ImagesModel = ImagesModel()
    ar_config: ARConfigModel = ARConfigModel()
    metadata: MetadataModel = MetadataModel()
    stock: StockModel = StockModel()
    share_link: ShareLinkModel
    analytics: AnalyticsModel = AnalyticsModel()
    seo: SEOModel = SEOModel()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    status: JewelryStatus = JewelryStatus.ACTIVE


class JewelryItemCreate(BaseModel):
    """Model for creating jewelry item"""
    name: str = Field(..., min_length=1, max_length=200)
    type: JewelryType
    description: Optional[str] = Field(None, max_length=1000)
    price: PriceModel
    metadata: Optional[MetadataModel] = MetadataModel()
    ar_config: Optional[ARConfigModel] = ARConfigModel()
    stock: Optional[StockModel] = StockModel()


class JewelryItemUpdate(BaseModel):
    """Model for updating jewelry item"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[JewelryType] = None
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[PriceModel] = None
    metadata: Optional[MetadataModel] = None
    ar_config: Optional[ARConfigModel] = None
    stock: Optional[StockModel] = None
    status: Optional[JewelryStatus] = None


# ==============================================
# Analytics Models
# ==============================================

class UserDataModel(BaseModel):
    """User data for analytics"""
    device: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    location: Optional[Dict[str, str]] = None
    ip_address: Optional[str] = None


class SourceModel(BaseModel):
    """Traffic source information"""
    platform: Optional[str] = None  # tiktok, instagram, direct, google
    referrer: Optional[str] = None
    campaign: Optional[str] = None


class InteractionsModel(BaseModel):
    """User interaction data"""
    camera_started: bool = False
    face_detected: bool = False
    photo_captured: bool = False
    shared: bool = False


class AnalyticsEvent(BaseModel):
    """Analytics event model"""
    event_id: str
    jewelry_id: str
    event_type: EventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None
    user_data: Optional[UserDataModel] = UserDataModel()
    source: Optional[SourceModel] = SourceModel()
    duration_seconds: Optional[int] = Field(None, ge=0)
    interactions: Optional[InteractionsModel] = InteractionsModel()


class AnalyticsEventCreate(BaseModel):
    """Model for creating analytics event"""
    jewelry_id: str
    event_type: EventType
    session_id: Optional[str] = None
    user_data: Optional[UserDataModel] = None
    source: Optional[SourceModel] = None
    duration_seconds: Optional[int] = None
    interactions: Optional[InteractionsModel] = None


# ==============================================
# Response Models
# ==============================================

class SuccessResponse(BaseModel):
    """Standard success response"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: str
    details: Optional[Any] = None


class JewelryListResponse(BaseModel):
    """Response for jewelry list"""
    success: bool = True
    items: List[Dict[str, Any]]
    count: int
    page: int = 1
    page_size: int = 20
    total_pages: int


class AnalyticsSummary(BaseModel):
    """Analytics summary response"""
    total_items: int
    total_views: int
    total_try_ons: int
    total_shares: int
    total_conversions: int
    total_revenue: float
    conversion_rate: float
    top_items: List[Dict[str, Any]]
