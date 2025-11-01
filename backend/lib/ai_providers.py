"""AI Provider implementations for jewelry try-on"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Base class for AI providers"""

    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config
        self.api_key = config.get("api_key", "")
        self.model = config.get("model", "")

    @abstractmethod
    async def place_jewelry(
        self,
        user_photo: str,
        jewelry_data: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Place jewelry on user photo using AI"""
        pass


class FalProvider(AIProvider):
    """Fal.ai provider implementation"""

    def __init__(self, config: Dict[str, Any]):
        super().__init__("fal", config)
        self.base_url = "https://queue.fal.run"

    async def place_jewelry(
        self,
        user_photo: str,
        jewelry_data: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Place jewelry using Fal.ai"""
        try:
            if not self.api_key:
                return {
                    "success": False,
                    "error": "FAL_API_KEY not configured"
                }

            # Build prompt for jewelry placement
            jewelry_type = jewelry_data.get("type", "ring")
            metal = jewelry_data.get("metal", "gold")
            stone = jewelry_data.get("stone", "")
            style = jewelry_data.get("style", "elegant")

            prompt = f"A person wearing a beautiful {style} {metal} {jewelry_type}"
            if stone:
                prompt += f" with {stone}"
            prompt += ", professional product photography, high quality, detailed"

            # Prepare request with optimized settings
            request_data = {
                "prompt": prompt,
                "image_url": user_photo if user_photo.startswith("http") else None,
                "strength": options.get("strength", 0.75) if options else 0.75,
                "num_inference_steps": options.get("steps", 28) if options else 28,
                "guidance_scale": options.get("guidance", 3.5) if options else 3.5,
            }

            # Use async client with connection pooling
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Key {self.api_key}",
                    "Content-Type": "application/json"
                }

                response = await client.post(
                    f"{self.base_url}/{self.model}",
                    headers=headers,
                    json=request_data
                )

                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "image_url": result.get("images", [{}])[0].get("url", ""),
                        "metadata": result,
                        "cost": result.get("cost", 0)
                    }
                else:
                    logger.error(f"Fal.ai error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code}"
                    }

        except Exception as e:
            logger.error(f"Fal.ai exception: {e}")
            return {
                "success": False,
                "error": str(e)
            }


class ReplicateProvider(AIProvider):
    """Replicate provider implementation"""

    def __init__(self, config: Dict[str, Any]):
        super().__init__("replicate", config)
        self.base_url = "https://api.replicate.com/v1"

    async def place_jewelry(
        self,
        user_photo: str,
        jewelry_data: Dict[str, Any],
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Place jewelry using Replicate"""
        try:
            if not self.api_key:
                return {
                    "success": False,
                    "error": "REPLICATE_API_TOKEN not configured"
                }

            # Build prompt
            jewelry_type = jewelry_data.get("type", "ring")
            metal = jewelry_data.get("metal", "gold")
            stone = jewelry_data.get("stone", "")
            style = jewelry_data.get("style", "elegant")

            prompt = f"A person wearing a beautiful {style} {metal} {jewelry_type}"
            if stone:
                prompt += f" with {stone}"
            prompt += ", professional product photography, high quality, detailed"

            # Use async client with connection pooling
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Authorization": f"Token {self.api_key}",
                    "Content-Type": "application/json"
                }

                request_data = {
                    "version": self.model,
                    "input": {
                        "prompt": prompt,
                        "image": user_photo,
                        "strength": options.get("strength", 0.75) if options else 0.75,
                        "num_inference_steps": options.get("steps", 28) if options else 28,
                        "guidance_scale": options.get("guidance", 3.5) if options else 3.5,
                    }
                }

                response = await client.post(
                    f"{self.base_url}/predictions",
                    headers=headers,
                    json=request_data
                )

                if response.status_code in [200, 201]:
                    result = response.json()
                    prediction_url = result.get("urls", {}).get("get", "")

                    # Poll for result (simplified - in production use webhooks)
                    for _ in range(30):  # Max 30 attempts
                        await asyncio.sleep(1)  # Simple delay
                        status_response = await client.get(prediction_url, headers=headers)
                        status_data = status_response.json()

                        if status_data.get("status") == "succeeded":
                            return {
                                "success": True,
                                "image_url": status_data.get("output", [""])[0],
                                "metadata": status_data,
                                "cost": 0  # Replicate pricing varies
                            }
                        elif status_data.get("status") == "failed":
                            return {
                                "success": False,
                                "error": "Prediction failed"
                            }

                    return {
                        "success": False,
                        "error": "Timeout waiting for result"
                    }
                else:
                    logger.error(f"Replicate error: {response.status_code}")
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code}"
                    }

        except Exception as e:
            logger.error(f"Replicate exception: {e}")
            return {
                "success": False,
                "error": str(e)
            }


def create_provider(provider_name: str, config: Dict[str, Any]) -> AIProvider:
    """Factory function to create AI provider instance"""
    providers = {
        "fal": FalProvider,
        "replicate": ReplicateProvider,
    }

    provider_class = providers.get(provider_name.lower())
    if not provider_class:
        raise ValueError(f"Unknown provider: {provider_name}")

    return provider_class(config)
