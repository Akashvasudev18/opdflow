from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.stats_service import get_dashboard_stats

router = APIRouter(tags=["stats"])


@router.get("/opd/stats")
def opd_stats(db: Session = Depends(get_db)):
    return get_dashboard_stats(db)
