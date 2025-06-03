from fastapi import APIRouter, HTTPException
from src.schemas.group import GroupCreate, GroupResponse, GroupMembersResponse, GroupId, GroupMember
from src.core.dependencies import GroupServiceDepends

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=GroupResponse)
async def create_group(data: GroupCreate, service: GroupServiceDepends):
    try:
        group = await service.create_group(data.name, data.creator_id)
        return group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{group_id}", response_model=GroupMembersResponse)
async def get_group(group_id: int, service: GroupServiceDepends):
    try:
        group = GroupId(id=group_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    group = await service.get_group(group.id)
    if group is None:
        raise HTTPException(status_code=404, detail=f"Группа с id: {group_id} не найдена")
    return group


@router.post("/add_member")
async def add_member(data: GroupMember, service: GroupServiceDepends) -> str:
    try:
        await service.chat_member_service.add_user_to_chat(data.group_id, data.user_id)
        return f"Пользователь {data.user_id} добавлен в группу {data.group_id}"
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
