import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VIBE-LA YouDrawIt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_merged_data() -> pd.DataFrame:
    students = pd.read_csv(os.path.join(DATA_DIR, "enrolled_students.csv"))
    gradebook = pd.read_csv(os.path.join(DATA_DIR, "gradebook.csv"))
    applied = pd.read_csv(os.path.join(DATA_DIR, "appliedclassstats.csv"))
    access = pd.read_csv(os.path.join(DATA_DIR, "access.csv"))

    # Prefix applied class columns to avoid clashes
    applied_renamed = applied.rename(
        columns={c: f"applied_{c}" for c in applied.columns if c != "username"}
    )
    # Prefix access columns
    access_renamed = access.rename(
        columns={c: f"access_{c}" for c in access.columns if c != "username"}
    )

    merged = students.merge(gradebook, on="username", how="left")
    merged = merged.merge(applied_renamed, on="username", how="left")
    merged = merged.merge(access_renamed, on="username", how="left")

    # Add dummy email
    merged["email"] = merged["username"] + "@student.uq.edu.au"

    return merged


def load_course_details() -> dict:
    course = pd.read_csv(os.path.join(DATA_DIR, "course_details.csv"))
    return course.iloc[0].to_dict()


@app.get("/api/course")
def get_course():
    return load_course_details()


@app.get("/api/students")
def get_students():
    df = load_merged_data()
    return df[["username", "first_name", "last_name", "email"]].to_dict(orient="records")


@app.get("/api/student/{username}")
def get_student(username: str):
    df = load_merged_data()
    student = df[df["username"] == username]
    if student.empty:
        raise HTTPException(status_code=404, detail="Student not found")

    row = student.iloc[0]
    course = load_course_details()

    # Build access timeseries
    access_weeks = []
    for w in range(1, 14):
        col = f"access_week{w}"
        val = row.get(col)
        access_weeks.append({
            "week": w,
            "clicks": None if pd.isna(val) else int(val),
        })

    # Build applied class completions
    applied_total = 0
    for w in range(2, 13):
        col = f"applied_week{w}"
        val = row.get(col)
        if not pd.isna(val) and int(val) == 1:
            applied_total += 1

    # Build weekly activities completed (out of 5 each, weeks 2-8)
    weekly_activities_completed = 0
    weekly_activities_total = 7  # weeks 2 through 8
    for w in range(2, 9):
        col = f"week{w}_activity"
        val = row.get(col)
        if not pd.isna(val) and int(val) >= 3:  # count as "completed" if >= 3/5
            weekly_activities_completed += 1

    # Weekly activity scores
    weekly_scores = []
    for w in range(2, 9):
        col = f"week{w}_activity"
        val = row.get(col)
        weekly_scores.append({
            "week": w,
            "score": None if pd.isna(val) else int(val),
            "max_score": 5,
        })

    # Assessment items
    assessments = []
    for item in ["design_document", "web_project", "code_review", "exam"]:
        val = row.get(item)
        assessments.append({
            "name": item.replace("_", " ").title(),
            "score": None if pd.isna(val) else int(val),
        })

    return {
        "username": row["username"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "email": row["email"],
        "degree_program": row["degree_program"],
        "course": course,
        "access_timeseries": access_weeks,
        "applied_classes_completed": applied_total,
        "applied_classes_total": 11,  # weeks 2-12
        "weekly_activities_completed": weekly_activities_completed,
        "weekly_activities_total": weekly_activities_total,
        "weekly_scores": weekly_scores,
        "assessments": assessments,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
