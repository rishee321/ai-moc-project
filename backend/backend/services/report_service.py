from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import mm

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether
)

from models.user_model import User
from models.interview_model import Interview
from models.question_model import Question
from models.answer_model import Answer
from models.result_model import Result
from models.skill_gap_model import SkillGapAnalysis
from models.improvement_plan_model import ImprovementPlan


def generate_interview_report(db, interview_id):

    # =====================================================
    # GET INTERVIEW
    # =====================================================

    interview = db.query(Interview).filter(
        Interview.id == interview_id
    ).first()

    if not interview:
        return None

    # =====================================================
    # GET USER
    # =====================================================

    user = db.query(User).filter(
        User.id == interview.user_id
    ).first()

    # =====================================================
    # GET RESULT
    # =====================================================

    result = db.query(Result).filter(
        Result.interview_id == interview_id
    ).first()

    # =====================================================
    # GET QUESTIONS
    # =====================================================

    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).all()

    # =====================================================
    # GET SKILL GAP ANALYSIS
    # =====================================================

    skill_gap = db.query(SkillGapAnalysis).filter(
        SkillGapAnalysis.interview_id == interview_id,
        SkillGapAnalysis.user_id == interview.user_id
    ).order_by(
        SkillGapAnalysis.id.desc()
    ).first()

    # =====================================================
    # GET IMPROVEMENT PLAN
    # =====================================================

    improvement_plan = db.query(ImprovementPlan).filter(
        ImprovementPlan.interview_id == interview_id,
        ImprovementPlan.user_id == interview.user_id
    ).order_by(
        ImprovementPlan.id.desc()
    ).first()

    # =====================================================
    # CREATE PDF
    # =====================================================

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )

    styles = getSampleStyleSheet()

    # =====================================================
    # STYLES
    # =====================================================

    title_style = ParagraphStyle(
        "ProfessionalTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=22,
        leading=28,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["BodyText"],
        alignment=TA_CENTER,
        fontSize=11,
        leading=16,
        spaceAfter=15
    )

    heading_style = ParagraphStyle(
        "ProfessionalHeading",
        parent=styles["Heading2"],
        fontSize=15,
        leading=19,
        spaceBefore=14,
        spaceAfter=8
    )

    subheading_style = ParagraphStyle(
        "SubHeading",
        parent=styles["Heading3"],
        fontSize=12,
        leading=16,
        spaceBefore=8,
        spaceAfter=5
    )

    normal_style = ParagraphStyle(
        "ProfessionalBody",
        parent=styles["BodyText"],
        fontSize=9.5,
        leading=14,
        spaceAfter=5
    )

    small_style = ParagraphStyle(
        "SmallText",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11
    )

    score_style = ParagraphStyle(
        "ScoreStyle",
        parent=styles["BodyText"],
        alignment=TA_CENTER,
        fontSize=14,
        leading=18
    )

    # =====================================================
    # STORY
    # =====================================================

    story = []

    # =====================================================
    # COVER / HEADER
    # =====================================================

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "AI INTERVIEW COACH",
            title_style
        )
    )

    story.append(
        Paragraph(
            "Professional Interview Performance Report",
            subtitle_style
        )
    )

    story.append(
        Table(
            [
                [
                    Paragraph(
                        "<b>Generated On</b>",
                        normal_style
                    ),
                    datetime.now().strftime(
                        "%d %B %Y, %I:%M %p"
                    )
                ]
            ],
            colWidths=[120, 350]
        )
    )

    story.append(Spacer(1, 20))

    # =====================================================
    # CANDIDATE INFORMATION
    # =====================================================

    story.append(
        Paragraph(
            "1. Candidate & Interview Information",
            heading_style
        )
    )

    candidate_name = (
        user.name
        if user else "N/A"
    )

    candidate_email = (
        user.email
        if user else "N/A"
    )

    interview_data = [
        ["Candidate Name", candidate_name],
        ["Email", candidate_email],
        ["Interview Type", interview.interview_type],
        ["Domain", interview.domain],
        ["Difficulty", interview.difficulty],
        [
            "Total Questions",
            str(interview.total_questions)
        ],
        [
            "Interview Status",
            interview.status
        ]
    ]

    interview_table = Table(
        interview_data,
        colWidths=[150, 320],
        repeatRows=0
    )

    interview_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),
            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.lightgrey
            ),
            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                "Helvetica-Bold"
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "PADDING",
                (0, 0),
                (-1, -1),
                7
            )
        ])
    )

    story.append(interview_table)

    # =====================================================
    # PERFORMANCE SUMMARY
    # =====================================================

    story.append(
        Paragraph(
            "2. Performance Summary",
            heading_style
        )
    )

    if result:

        overall = (
            result.overall_score
            if result.overall_score is not None
            else 0
        )

        technical = (
            result.technical_score
            if result.technical_score is not None
            else 0
        )

        communication = (
            result.communication_score
            if result.communication_score is not None
            else 0
        )

        problem_solving = (
            result.problem_solving_score
            if result.problem_solving_score is not None
            else 0
        )

        score_data = [
            [
                "Overall",
                "Technical",
                "Communication",
                "Problem Solving"
            ],
            [
                f"{overall}/10",
                f"{technical}/10",
                f"{communication}/10",
                f"{problem_solving}/10"
            ]
        ]

        score_table = Table(
            score_data,
            colWidths=[117] * 4
        )

        score_table.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER"
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    10
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    9
                )
            ])
        )

        story.append(score_table)

        story.append(Spacer(1, 12))

        # =================================================
        # AI SUMMARY
        # =================================================

        story.append(
            Paragraph(
                "AI Performance Summary",
                subheading_style
            )
        )

        summary_text = (
            result.suggestions
            or "No AI performance summary available."
        )

        story.append(
            Paragraph(
                summary_text,
                normal_style
            )
        )

    else:

        story.append(
            Paragraph(
                "Interview result is not available yet.",
                normal_style
            )
        )

    # =====================================================
    # STRENGTHS / WEAKNESSES
    # =====================================================

    if result:

        story.append(
            Paragraph(
                "3. Strengths",
                heading_style
            )
        )

        story.append(
            Paragraph(
                result.strengths
                or "No strengths available.",
                normal_style
            )
        )

        story.append(
            Paragraph(
                "4. Areas for Improvement",
                heading_style
            )
        )

        story.append(
            Paragraph(
                result.weaknesses
                or "No weaknesses available.",
                normal_style
            )
        )

        story.append(
            Paragraph(
                "5. AI Recommendations",
                heading_style
            )
        )

        story.append(
            Paragraph(
                result.suggestions
                or "No recommendations available.",
                normal_style
            )
        )

    # =====================================================
    # SKILL GAP ANALYSIS
    # =====================================================

    story.append(
        Paragraph(
            "6. Skill Gap Analysis",
            heading_style
        )
    )

    if skill_gap:

        skill_gap_data = [
            [
                "Category",
                "Analysis"
            ],
            [
                "Strong Skills",
                skill_gap.strong_skills
                or "Not available"
            ],
            [
                "Moderate Skills",
                skill_gap.moderate_skills
                or "Not available"
            ],
            [
                "Weak Skills",
                skill_gap.weak_skills
                or "Not available"
            ],
            [
                "Missing Skills",
                skill_gap.missing_skills
                or "Not available"
            ]
        ]

        skill_table = Table(
            skill_gap_data,
            colWidths=[130, 340]
        )

        skill_table.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ])
        )

        story.append(skill_table)

        story.append(Spacer(1, 10))

        story.append(
            Paragraph(
                "<b>Skill Gap Recommendations:</b> "
                + (
                    skill_gap.recommendations
                    or "No recommendations available."
                ),
                normal_style
            )
        )

    else:

        story.append(
            Paragraph(
                "Skill Gap Analysis has not been generated.",
                normal_style
            )
        )

    # =====================================================
    # IMPROVEMENT PLAN
    # =====================================================

    story.append(
        Paragraph(
            "7. Personalized Improvement Plan",
            heading_style
        )
    )

    if improvement_plan:

        story.append(
            Paragraph(
                f"<b>Plan Duration:</b> "
                f"{improvement_plan.duration_days} days",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Focus Areas:</b> "
                f"{improvement_plan.focus_areas or 'Not available'}",
                normal_style
            )
        )

        story.append(
            Spacer(1, 5)
        )

        plan_text = (
            improvement_plan.plan
            or "Improvement plan not available."
        )

        for line in plan_text.splitlines():

            line = line.strip()

            if not line:
                continue

            story.append(
                Paragraph(
                    line,
                    normal_style
                )
            )

    else:

        story.append(
            Paragraph(
                "Personalized Improvement Plan "
                "has not been generated.",
                normal_style
            )
        )

    # =====================================================
    # QUESTIONS AND ANSWERS
    # =====================================================

    story.append(PageBreak())

    story.append(
        Paragraph(
            "8. Question-wise Performance",
            heading_style
        )
    )

    for index, question in enumerate(
        questions,
        start=1
    ):

        answer = db.query(Answer).filter(
            Answer.question_id == question.id
        ).order_by(
            Answer.id.desc()
        ).first()

        question_block = []

        question_block.append(
            Paragraph(
                f"<b>Question {index}</b>",
                subheading_style
            )
        )

        question_block.append(
            Paragraph(
                f"<b>Question:</b> "
                f"{question.question_text}",
                normal_style
            )
        )

        question_block.append(
            Paragraph(
                f"<b>Category:</b> "
                f"{question.category or 'General'}",
                normal_style
            )
        )

        question_block.append(
            Paragraph(
                f"<b>Difficulty:</b> "
                f"{question.difficulty or 'N/A'}",
                normal_style
            )
        )

        if answer:

            question_block.append(
                Paragraph(
                    f"<b>Candidate Answer:</b> "
                    f"{answer.answer_text}",
                    normal_style
                )
            )

            question_block.append(
                Paragraph(
                    f"<b>Score:</b> "
                    f"{answer.score if answer.score is not None else 0}/10",
                    normal_style
                )
            )

            if answer.feedback:

                question_block.append(
                    Paragraph(
                        f"<b>AI Feedback:</b> "
                        f"{answer.feedback}",
                        normal_style
                    )
                )

        else:

            question_block.append(
                Paragraph(
                    "<b>Candidate Answer:</b> Not answered",
                    normal_style
                )
            )

        question_block.append(
            Spacer(1, 8)
        )

        story.append(
            KeepTogether(question_block)
        )

    # =====================================================
    # FINAL MESSAGE
    # =====================================================

    story.append(Spacer(1, 15))

    story.append(
        Table(
            [
                [
                    Paragraph(
                        "<b>AI Interview Coach</b><br/>"
                        "Practice. Improve. Succeed.",
                        normal_style
                    )
                ]
            ],
            colWidths=[470]
        )
    )

    # =====================================================
    # FOOTER
    # =====================================================

    def add_footer(canvas, doc):

        canvas.saveState()

        canvas.setFont(
            "Helvetica",
            8
        )

        canvas.drawString(
            18 * mm,
            10 * mm,
            "AI Interview Coach"
        )

        canvas.drawRightString(
            A4[0] - 18 * mm,
            10 * mm,
            f"Page {doc.page}"
        )

        canvas.restoreState()

    # =====================================================
    # BUILD PDF
    # =====================================================

    document.build(
        story,
        onFirstPage=add_footer,
        onLaterPages=add_footer
    )

    buffer.seek(0)

    return buffer