"""Auth router — register, login, update settings."""
from fastapi import APIRouter, HTTPException, Depends

from app.models.schemas import RegisterRequest, LoginRequest, SettingsUpdate, TokenResponse, UserResponse
from app.auth import hash_password, verify_password, create_token, get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest):
    """Register a new user."""
    db = get_db()
    if db is None:
        # Demo mode
        token = create_token("demo_user")
        return TokenResponse(
            token=token,
            user=UserResponse(id="demo_user", email=req.email, name=req.name, plan="free"),
        )

    # Check if user exists
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user_doc = {
        "email": req.email,
        "password": hash_password(req.password),
        "name": req.name,
        "plan": "free",
        "hf_token": "",
        "kaggle_username": "",
        "kaggle_key": "",
        "jobs_used_this_month": 0,
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_token(user_id)
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=req.email, name=req.name, plan="free"),
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Login with email and password."""
    db = get_db()
    if db is None:
        # Demo mode
        token = create_token("demo_user")
        return TokenResponse(
            token=token,
            user=UserResponse(id="demo_user", email=req.email, name="Demo User", plan="free"),
        )

    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id)
    return TokenResponse(
        token=token,
        user=UserResponse(id=user_id, email=user["email"], name=user["name"], plan=user.get("plan", "free")),
    )


@router.put("/settings")
async def update_settings(req: SettingsUpdate, user=Depends(get_current_user)):
    """Update user settings (HF token, Kaggle credentials)."""
    db = get_db()
    if db is None:
        return {"message": "Settings saved (demo mode)", "user": user}

    update = {}
    if req.name is not None:
        update["name"] = req.name
    if req.hf_token is not None:
        update["hf_token"] = req.hf_token
    if req.kaggle_username is not None:
        update["kaggle_username"] = req.kaggle_username
    if req.kaggle_key is not None:
        update["kaggle_key"] = req.kaggle_key

    if update:
        from bson import ObjectId
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update})

    return {"message": "Settings updated successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        id=str(user.get("_id", "demo")),
        email=user.get("email", "demo@finetunestudio.com"),
        name=user.get("name", "Demo User"),
        plan=user.get("plan", "free"),
    )
