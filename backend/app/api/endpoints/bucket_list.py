from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.place import Place
from app.models.bucket_list import BucketListItem
from app.schemas.bucket_list import (
    BucketListItem as BucketListItemSchema,
    BucketListItemCreate,
    BucketListItemUpdate,
)

router = APIRouter()

@router.get("/", response_model=List[BucketListItemSchema])
async def list_bucket_list(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(BucketListItem).options(joinedload(BucketListItem.place)).filter(
        BucketListItem.user_id == current_user.id
    )
    if status_filter and status_filter != "All Places":
        q = q.filter(BucketListItem.status == status_filter)
    return q.order_by(BucketListItem.created_at.desc()).all()

@router.post("/", response_model=BucketListItemSchema, status_code=status.HTTP_201_CREATED)
async def add_to_bucket_list(
    item_in: BucketListItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    place = db.query(Place).filter(Place.id == item_in.place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    existing = db.query(BucketListItem).filter(
        BucketListItem.user_id == current_user.id,
        BucketListItem.place_id == item_in.place_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="This place is already on your bucket list")

    item = BucketListItem(
        user_id=current_user.id,
        place_id=item_in.place_id,
        status=item_in.status,
        source=item_in.source,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{item_id}", response_model=BucketListItemSchema)
async def update_bucket_list_item(
    item_id: str,
    item_in: BucketListItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(BucketListItem).filter(
        BucketListItem.id == item_id,
        BucketListItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Bucket list item not found")

    item.status = item_in.status
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_bucket_list(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(BucketListItem).filter(
        BucketListItem.id == item_id,
        BucketListItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Bucket list item not found")

    db.delete(item)
    db.commit()
    return None
