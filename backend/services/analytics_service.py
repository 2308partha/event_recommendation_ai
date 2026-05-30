from database.db import event_collection, registration_collection, user_collection
from bson import ObjectId

class AnalyticsService:
    @staticmethod
    async def get_admin_dashboard_metrics(admin_clerk_id: str) -> dict:
        """
        Fetch metrics for the admin dashboard.
        """
        # For simplicity, we fetch global metrics or metrics specific to the admin's college.
        # Here we just fetch global as a stub.
        
        total_users = await user_collection.count_documents({})
        total_events = await event_collection.count_documents({})
        total_registrations = await registration_collection.count_documents({})
        
        # Calculate overall attendance rate
        total_attended = await registration_collection.count_documents({"attended": True})
        attendance_rate = (total_attended / total_registrations * 100) if total_registrations > 0 else 0
        
        # Get top 5 popular events (by registration count)
        cursor = event_collection.find({}).sort("registration_count", -1).limit(5)
        popular_events = []
        async for doc in cursor:
            popular_events.append({
                "title": doc.get("title"),
                "registrations": doc.get("registration_count", 0),
                "attendance": doc.get("attendance_count", 0)
            })
            
        return {
            "total_users": total_users,
            "total_events": total_events,
            "total_registrations": total_registrations,
            "attendance_rate": round(attendance_rate, 2),
            "popular_events": popular_events
        }
