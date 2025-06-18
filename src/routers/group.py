from fastapi import APIRouter, HTTPException

from src.schemas.base import PositiveIntID
from src.core.exceptions import NotFoundError
from src.core.dependencies import GroupServiceDepends

from src.schemas.group import (
    GroupCreate,
    GroupMember,
    GroupMemberResponse,
    GroupMembersResponse,
    GroupResponse,
)

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=GroupResponse)
async def create_group(data: GroupCreate, service: GroupServiceDepends):
    try:
        return await service.create_group(data.name, data.creator_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{group_id}", response_model=GroupMembersResponse)
async def get_group(group_id: PositiveIntID, service: GroupServiceDepends):
    try:
        group = await service.get_group(group_id)
        if group is None:
            raise NotFoundError(f"Группа с id: {group_id} не найдена")
        return group
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/add_member", response_model=GroupMemberResponse, status_code=201)
async def add_member(data: GroupMember, service: GroupServiceDepends):
    try:
        await service.chat_member_service.add_user_to_chat(data.group_id, data.user_id)
        return GroupMemberResponse(group_id=data.group_id, user_id=data.user_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
