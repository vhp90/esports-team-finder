from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from bson import ObjectId
from models.team import TeamCreate, TeamUpdate, TeamResponse
from dependencies import get_current_user, get_db

router = APIRouter()

@router.post("/", response_model=TeamResponse)
async def create_team(team: TeamCreate, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    team_data = team.dict()
    team_data.update({
        "leader_id": str(current_user["_id"]),
        "members": [str(current_user["_id"])],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    result = await db.teams.insert_one(team_data)
    team_data["id"] = str(result.inserted_id)
    return team_data

@router.get("/", response_model=List[TeamResponse])
async def list_teams(game: str = None, skill_level: str = None, db = Depends(get_db)):
    query = {}
    if game:
        query["game"] = game
    if skill_level:
        query["skill_level"] = skill_level
        
    teams = await db.teams.find(query).to_list(length=50)
    for team in teams:
        team["id"] = str(team["_id"])
    return teams

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: str, db = Depends(get_db)):
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    team["id"] = str(team["_id"])
    return team

@router.post("/{team_id}/join")
async def join_team(team_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    user_id = str(current_user["_id"])
    if user_id in team["members"]:
        raise HTTPException(status_code=400, detail="Already a member of this team")
        
    if len(team["members"]) >= team["max_members"]:
        raise HTTPException(status_code=400, detail="Team is full")
        
    await db.teams.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$push": {"members": user_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    return {"message": "Successfully joined team"}

@router.post("/{team_id}/leave")
async def leave_team(team_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    user_id = str(current_user["_id"])
    if user_id not in team["members"]:
        raise HTTPException(status_code=400, detail="Not a member of this team")
        
    if user_id == team["leader_id"]:
        raise HTTPException(status_code=400, detail="Team leader cannot leave. Transfer leadership first.")
        
    await db.teams.update_one(
        {"_id": ObjectId(team_id)},
        {
            "$pull": {"members": user_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    return {"message": "Successfully left team"}

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: str,
    team_update: TeamUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if str(current_user["_id"]) != team["leader_id"]:
        raise HTTPException(status_code=403, detail="Only team leader can update team")
        
    update_data = {k: v for k, v in team_update.dict(exclude_unset=True).items()}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.teams.update_one(
            {"_id": ObjectId(team_id)},
            {"$set": update_data}
        )
        
    updated_team = await db.teams.find_one({"_id": ObjectId(team_id)})
    updated_team["id"] = str(updated_team["_id"])
    return updated_team

@router.delete("/{team_id}")
async def delete_team(team_id: str, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    team = await db.teams.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    if str(current_user["_id"]) != team["leader_id"]:
        raise HTTPException(status_code=403, detail="Only team leader can delete team")
        
    await db.teams.delete_one({"_id": ObjectId(team_id)})
    return {"message": "Team successfully deleted"}
