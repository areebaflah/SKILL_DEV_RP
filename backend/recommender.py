COURSE_CATALOG = {
    "Beginner": [
        {
            "label": "Foundations of Problem Solving",
            "platform": "YouTube",
            "url": "https://www.youtube.com/watch?v=example1"
        }
    ],
    "Intermediate": [
        {
            "label": "Analytical Problem Solving",
            "platform": "Udemy",
            "url": "https://www.udemy.com/course/example2"
        },
        {
            "label": "Logical Thinking Masterclass",
            "platform": "YouTube",
            "url": "https://www.youtube.com/watch?v=example3"
        }
    ],
    "Advanced": [
        {
            "label": "Advanced Strategic Thinking",
            "platform": "Coursera",
            "url": "https://www.coursera.org/example4"
        }
    ]
}

def recommend_courses_by_score(final_score: float):
    """
    Recommend courses based on the predicted final_score
    """
    if final_score < 2:
        # Low score → Beginner courses
        return COURSE_CATALOG["Beginner"]
    elif final_score < 3.5:
        # Medium score → Beginner + Intermediate
        return COURSE_CATALOG["Beginner"] + COURSE_CATALOG["Intermediate"]
    else:
        # High score → All courses
        return COURSE_CATALOG["Beginner"] + COURSE_CATALOG["Intermediate"] + COURSE_CATALOG["Advanced"]
 