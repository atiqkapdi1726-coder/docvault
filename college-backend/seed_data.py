"""
Seed the database with sample workspace data.
Idempotent: skips if data already exists.

Usage:  python seed_data.py
"""

import os
import sys
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import repository as repo
from ml.classifier import classify_text

random.seed(42)

SAMPLE_DOCUMENTS = [
    # (name, description, tags, mime, size_kb)
    ("Invoice_2026_Q1_VendorTech.pdf", "payment due total amount 5000 for consulting services", ["invoice", "payment"], "application/pdf", 120),
    ("Invoice_2026_Q2_CloudHost.pdf", "bill amount due cloud hosting services monthly", ["invoice"], "application/pdf", 98),
    ("Invoice_March_Electricity.pdf", "electricity bill units consumed amount payable", ["invoice", "utility"], "application/pdf", 85),
    ("Invoice_April_Internet.pdf", "internet broadband monthly bill payment due", ["invoice"], "application/pdf", 90),
    ("Invoice_OfficeSupplies.pdf", "stationery supplies order total amount due vendor", ["invoice"], "application/pdf", 75),
    ("Resume_Atique_Kapdi.pdf", "curriculum vitae skills python react developer experience education", ["resume", "cv"], "application/pdf", 340),
    ("Resume_Backend_Developer.pdf", "cv experience flask django python sql projects", ["resume"], "application/pdf", 310),
    ("Resume_Intern_Application.docx", "candidate applying skills java javascript education", ["resume"], "application/msword", 150),
    ("Resume_Data_Analyst.pdf", "analyst resume pandas power bi sql tableau experience", ["resume", "data"], "application/pdf", 320),
    ("Annual_Report_2025.pdf", "report analysis annual performance revenue growth findings", ["report", "annual"], "application/pdf", 850),
    ("Q3_Performance_Report.pdfx".replace("pdfx", "pdf"), "quarterly report results metrics kpi analysis", ["report", "quarterly"], "application/pdf", 620),
    ("Market_Research_Report.pdf", "research study survey findings trends market analysis", ["report", "research"], "application/pdf", 540),
    ("Project_Status_Report.docx", "project progress milestones deliverables status update", ["report", "status"], "application/msword", 210),
    ("Employee_Contract_Templates.docx", "employment contract terms conditions agreement parties signatures", ["contract", "hr"], "application/msword", 95),
    ("NDA_Confidentiality.pdf", "non disclosure agreement confidential parties legal binding terms", ["contract", "nda"], "application/pdf", 110),
    ("Office_Lease_Agreement.pdf", "rental lease agreement tenant landlord property terms", ["contract", "lease"], "application/pdf", 300),
    ("Vendor_Service_Agreement.pdf", "service agreement vendor obligations scope work", ["contract", "vendor"], "application/pdf", 180),
    ("Pitch_Deck_Startup.pptx", "presentation pitch deck investors startup idea funding", ["presentation", "pitch"], "application/vnd.ms-powerpoint", 2400),
    ("Product_Walkthrough_Slides.pptx", "presentation slides walkthrough product features tour", ["presentation"], "application/vnd.ms-powerpoint", 5600),
    ("Client_Proposal_Presentation.pptx", "proposal presentation client business strategy overview", ["presentation", "proposal"], "application/vnd.ms-powerpoint", 3100),
    ("Weekly_Team_Meeting_Notes.docx", "meeting minutes attendees agenda action items discussion", ["meeting", "notes"], "application/msword", 45),
    ("Board_Meeting_Minutes.pdf", "board meeting minutes resolutions approved attendees agenda", ["meeting", "board"], "application/pdf", 130),
    ("Kickoff_Meeting_Agenda.docx", "kickoff meeting agenda planning introduction project team", ["meeting"], "application/msword", 38),
    ("Standup_Sync_Notes.txt", "standup sync discussion blockers updates tasks daily", ["meeting", "standup"], "text/plain", 12),
    ("Employee_Handbook_Policy.pdf", "company policy handbook code conduct employees guidelines hr", ["policy", "hr"], "application/pdf", 950),
    ("IT_Security_Policy.pdf", "security policy password access control requirements compliance", ["policy", "security"], "application/pdf", 420),
    ("Remote_Work_Policy.docx", "remote work policy procedure guidelines employees hybrid", ["policy"], "application/msword", 140),
    ("Privacy_Policy_GDPR.pdf", "privacy policy data protection gdpr compliance terms", ["policy", "legal"], "application/pdf", 380),
    ("Balance_Sheet_2025.xlsx", "financial balance sheet assets liabilities equity accounting", ["financial", "accounts"], "application/vnd.ms-excel", 480),
    ("Cash_Flow_Statement.xlsx", "cash flow statement income expenses quarterly financial", ["financial"], "application/vnd.ms-excel", 350),
    ("Budget_2026_Plan.xlsx", "budget allocation spending plan fiscal year financial forecast", ["financial", "budget"], "application/vnd.ms-excel", 290),
    ("Tax_Return_Filing.pdf", "tax return filing income deduction forms financial year", ["financial", "tax"], "application/pdf", 610),
    ("Legal_Notice_Case_2026.pdf", "legal notice court plaintiff defendant case law suit", ["legal", "notice"], "application/pdf", 220),
    ("Terms_Of_Service.pdf", "terms service conditions use liability legal website", ["legal", "terms"], "application/pdf", 190),
    ("Power_Of_Attorney.docx", "power attorney legal representative rights notary document", ["legal"], "application/msword", 80),
    ("Arbitration_Settlement.pdf", "settlement dispute arbitration mediation legal agreement", ["legal", "dispute"], "application/pdf", 260),
    ("Shopping_List_Personal.txt", "list items todo shopping personal notes grocery", ["general", "personal"], "text/plain", 8),
    ("Certificate_Achievement.pdf", "certificate award achievement recognition completion", ["general", "certificate"], "application/pdf", 400),
    ("Event_Planning_Checklist.xlsx", "checklist event planning tasks todo list organization", ["general"], "application/vnd.ms-excel", 60),
    ("Whiteboard_Brainstorm.jpg", "diagram sketch brainstorm ideas drawing plan", ["general", "notes"], "image/jpeg", 750),
]

USERS = ["atiqkapdi1726", "prof_reviewer", "team_lead", "intern_user"]
ACTIONS = ["upload", "classify", "download", "share", "view"]


def seed():
    existing = repo.find_documents(limit=1)
    if existing:
        print(f"Documents already exist ({len(repo.find_documents(limit=1000))}). Skipping seed.")
        print("Delete the 'documents' collection in Atlas to re-seed.")
        return

    print("Seeding database with sample data...")
    for name, desc, tags, mime, size_kb in SAMPLE_DOCUMENTS:
        text = f"{name} {desc} {' '.join(tags)}"
        prediction = classify_text(text)
        user = random.choice(USERS)

        doc = repo.insert_document(
            {
                "name": name,
                "description": desc,
                "tags": tags,
                "mimeType": mime,
                "fileSize": size_kb * 1024,
                "user": user,
                "ml_category": prediction["category"],
                "ml_confidence": prediction["confidence"],
                "ml_model": prediction["model_used"],
            }
        )
        repo.log_prediction(
            {
                "input_text": text[:300],
                "user": user,
                **prediction,
            }
        )
        repo.increment_counter("classifications")
        repo.increment_counter("uploads")
        print(f"  + {name}  ->  {prediction['category']} ({prediction['confidence'] * 100:.0f}%)")

    # simulate activity counters
    for action in ACTIONS:
        repo.increment_counter(f"action_{action}", amount=random.randint(5, 40))

    print("\nDone! Seeded", len(SAMPLE_DOCUMENTS), "documents into MongoDB Atlas.")
    print("Open Power BI and load: http://localhost:5000/api/analytics/export.csv")


if __name__ == "__main__":
    seed()
