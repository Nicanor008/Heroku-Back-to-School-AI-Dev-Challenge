import chalk from "chalk";

// Back-to-school specific contexts and challenges for each persona
const BACK_TO_SCHOOL_CONTEXTS = {
    student: {
        challenges: [
            "Adjusting sleep schedule for early mornings",
            "Organizing new school supplies and materials",
            "Building new study routines and habits",
            "Managing social anxiety about new classes/teachers",
            "Setting up homework and assignment tracking",
            "Preparing for extracurricular activities",
            "Learning new school layout and procedures"
        ],
        timeframes: {
            "2_weeks_before": "Pre-school preparation phase",
            "1_week_before": "Final preparation and anxiety management",
            "first_week": "Adjustment and routine building",
            "first_month": "Habit formation and optimization"
        }
    },
    parent: {
        challenges: [
            "Coordinating back-to-school shopping and supplies",
            "Adjusting family schedules around school hours",
            "Setting up communication with teachers",
            "Establishing homework supervision routines",
            "Managing multiple children's different needs",
            "Planning healthy meals and snacks",
            "Organizing transportation and pickup schedules",
            "Preparing for school events and meetings"
        ],
        timeframes: {
            "2_weeks_before": "Logistics and preparation planning",
            "1_week_before": "Final arrangements and family preparation",
            "first_week": "Supporting transition and establishing routines",
            "first_month": "Monitoring progress and adjusting systems"
        }
    },
    educator: {
        challenges: [
            "Setting up new classroom environment",
            "Preparing curriculum and lesson plans",
            "Learning about new students and their needs",
            "Establishing classroom management systems",
            "Coordinating with other teachers and staff",
            "Preparing parent communication strategies",
            "Setting up assessment and grading systems",
            "Planning ice-breakers and community building"
        ],
        timeframes: {
            "2_weeks_before": "Classroom setup and curriculum planning",
            "1_week_before": "Final preparations and mental readiness",
            "first_week": "Student assessment and routine establishment",
            "first_month": "Relationship building and system refinement"
        }
    }
};

async function queryHerokuAI(prompt) {
    try {
        const res = await fetch(`${process.env.INFERENCE_API_URL}/v1/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.INFERENCE_API_KEY}`,
            },
            body: JSON.stringify({
                model: "claude-4-sonnet",
                messages: [
                    {
                        role: "system",
                        content: "You are a specialized back-to-school transition planner. You understand the unique challenges, emotions, and logistics involved in returning to school. Always respond with ONLY a valid JSON array of planning activities. Each object must have 'time', 'category', 'activity', and 'purpose' fields."
                    },
                    { role: "user", content: prompt }
                ],
                max_tokens: 800,
                temperature: 0.7,
            }),
        });
        const data = await res.json();

        console.log(chalk.blue("AI Raw Response:"), data.choices[0].message.content);

        return data.choices[0].message.content || "[]";
    } catch (err) {
        console.error(chalk.red("⚠️ Error querying Heroku AI:"), err);
        return "[]";
    }
}

function parseScheduleFromAI(aiResponse) {
    try {
        console.log(chalk.cyan("Parsing AI response:"), aiResponse);

        let jsonContent = aiResponse;
        jsonContent = jsonContent.replace(/```(?:json)?\s*\n?/g, '').replace(/```\s*$/g, '');

        const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            const parsed = JSON.parse(arrayMatch[0]);
            console.log(chalk.green("✅ Successfully parsed schedule:"), parsed);
            return parsed;
        }

        const parsed = JSON.parse(jsonContent);
        if (Array.isArray(parsed)) {
            console.log(chalk.green("✅ Successfully parsed schedule:"), parsed);
            return parsed;
        }

        throw new Error("Response is not an array");

    } catch (err) {
        console.error(chalk.red("❌ Error parsing AI response:"), err);
        return getDefaultBackToSchoolPlan("student", "first_week");
    }
}

function getDefaultBackToSchoolPlan(role, phase) {
    const defaults = {
        student: {
            first_week: [
                { time: "7:00 AM - 7:30 AM", category: "Morning Routine", activity: "Wake up early and practice school morning routine", purpose: "Adjust to school schedule" },
                { time: "8:00 AM - 8:15 AM", category: "School Prep", activity: "Pack backpack and organize materials for day", purpose: "Build organizational habits" },
                { time: "3:30 PM - 4:00 PM", category: "Transition", activity: "Decompress from school day and snack", purpose: "Process emotions and recharge" },
                { time: "4:00 PM - 5:00 PM", category: "Homework", activity: "Start homework in quiet, organized space", purpose: "Establish study routine" },
                { time: "8:00 PM - 8:30 PM", category: "Next Day Prep", activity: "Prepare clothes and materials for tomorrow", purpose: "Reduce morning stress" }
            ]
        },
        parent: {
            first_week: [
                { time: "6:30 AM - 7:00 AM", category: "Family Prep", activity: "Wake up early to prepare breakfast and lunch", purpose: "Start day calmly" },
                { time: "7:30 AM - 8:00 AM", category: "School Drop-off", activity: "Walk/drive child to school, chat about the day", purpose: "Emotional support and connection" },
                { time: "3:00 PM - 3:30 PM", category: "After School", activity: "Pick up child, ask about their day", purpose: "Stay connected and assess needs" },
                { time: "4:00 PM - 5:00 PM", category: "Homework Support", activity: "Be available for homework help, create quiet space", purpose: "Support academic success" },
                { time: "7:00 PM - 7:30 PM", category: "Planning", activity: "Review tomorrow's schedule and prepare materials", purpose: "Stay organized and proactive" }
            ]
        },
        educator: {
            first_week: [
                { time: "7:00 AM - 7:30 AM", category: "Classroom Prep", activity: "Arrive early to set up materials and mental preparation", purpose: "Start day feeling prepared" },
                { time: "8:00 AM - 9:00 AM", category: "Morning Welcome", activity: "Greet students warmly, do ice-breaker activities", purpose: "Build classroom community" },
                { time: "12:00 PM - 12:30 PM", category: "Lunch Reflection", activity: "Take notes on student observations and needs", purpose: "Track student adjustment" },
                { time: "3:30 PM - 4:30 PM", category: "Planning", activity: "Adjust tomorrow's plans based on today's observations", purpose: "Responsive teaching" },
                { time: "Evening", category: "Self-Care", activity: "Decompress and celebrate small wins from the day", purpose: "Maintain wellbeing" }
            ]
        }
    };

    return defaults[role]?.[phase] || defaults.student.first_week;
}

/**
 * Enhanced Back-to-School Planner Agent
 * @param {string} role - persona: "student" | "parent" | "educator"
 * @param {string[]} subjects - list of subjects or focus areas
 * @param {string} phase - "2_weeks_before" | "1_week_before" | "first_week" | "first_month"
 * @param {string[]} specificChallenges - specific challenges this person is facing
 * @param {number} childrenAges - for parents, ages of children
 */
export async function backToSchoolPlannerAgent(
    role = "student",
    subjects = [],
    phase = "first_week",
    specificChallenges = [],
    childrenAges = []
) {
    const context = BACK_TO_SCHOOL_CONTEXTS[role] || BACK_TO_SCHOOL_CONTEXTS.student;
    const phaseDescription = context.timeframes[phase] || "General back-to-school planning";
    const relevantChallenges = [...context.challenges, ...specificChallenges];

    // Create comprehensive back-to-school focused prompts
    const rolePrompts = {
        student: `You are planning for a student's back-to-school transition during the ${phaseDescription} phase.

        SPECIFIC BACK-TO-SCHOOL CHALLENGES TO ADDRESS:
        ${relevantChallenges.slice(0, 5).map(c => `- ${c}`).join('\n')}
        
        SUBJECTS/FOCUS AREAS: ${subjects.join(", ") || "Math, Science, English, Social Studies"}
        PHASE: ${phase} (${phaseDescription})
        
        Create a day-by-day plan that helps with:
        - Sleep schedule adjustment and morning routines
        - Academic preparation and organization
        - Social and emotional adjustment
        - Building sustainable study habits
        - Managing back-to-school anxiety
        - Setting up systems for success
        
        Include specific times, categories (like "Morning Routine", "Academic Prep", "Social Adjustment", "Organization", "Self-Care"), activities, and the purpose/benefit of each activity.
        
        Respond with ONLY a JSON array like this:
        [
          {"time": "7:00 AM - 7:30 AM", "category": "Morning Routine", "activity": "Practice new wake-up time and morning routine", "purpose": "Adjust internal clock for school schedule"},
          {"time": "9:00 AM - 10:00 AM", "category": "Academic Prep", "activity": "Review math concepts from last year", "purpose": "Build confidence and refresh knowledge"},
          {"time": "2:00 PM - 2:30 PM", "category": "Organization", "activity": "Set up backpack organization system", "purpose": "Reduce morning stress and stay organized"}
        ]`,

        parent: `You are planning for a parent supporting their children's back-to-school transition during the ${phaseDescription} phase.
        
        SPECIFIC BACK-TO-SCHOOL CHALLENGES TO ADDRESS:
        ${relevantChallenges.slice(0, 5).map(c => `- ${c}`).join('\n')}
        
        CHILDREN'S FOCUS AREAS: ${subjects.join(", ") || "General academic support"}
        CHILDREN'S AGES: ${childrenAges.length > 0 ? childrenAges.join(", ") : "Elementary/Middle School age"}
        PHASE: ${phase} (${phaseDescription})
        
        Create a comprehensive plan that addresses:
        - Family schedule coordination and logistics
        - Emotional support for children's transition
        - Communication with school and teachers
        - Homework and study support systems
        - Back-to-school shopping and preparation
        - Managing multiple children's different needs
        - Creating supportive home environment
        
        Include specific times, categories (like "Logistics", "Family Support", "School Communication", "Home Organization", "Self-Care"), activities, and the purpose/benefit of each activity.
        
        Respond with ONLY a JSON array like this:
        [
          {"time": "6:30 AM - 7:00 AM", "category": "Family Support", "activity": "Prepare healthy breakfast and pack nutritious lunches", "purpose": "Fuel children for successful school days"},
          {"time": "8:00 AM - 8:30 AM", "category": "School Communication", "activity": "Email teachers to introduce yourself and ask about expectations", "purpose": "Build strong home-school partnership"},
          {"time": "3:30 PM - 4:00 PM", "category": "Emotional Support", "activity": "Check in with children about their school day", "purpose": "Process emotions and identify any issues early"}
        ]`,

        educator: `You are planning for an educator's back-to-school preparation and transition during the ${phaseDescription} phase.
        
        SPECIFIC BACK-TO-SCHOOL CHALLENGES TO ADDRESS:
        ${relevantChallenges.slice(0, 5).map(c => `- ${c}`).join('\n')}
        
        SUBJECT AREAS: ${subjects.join(", ") || "Core curriculum subjects"}
        PHASE: ${phase} (${phaseDescription})
        
        Create a comprehensive plan that addresses:
        - Classroom setup and learning environment
        - Curriculum planning and lesson preparation
        - Student assessment and relationship building
        - Parent and family communication
        - Classroom management systems
        - Professional collaboration with colleagues
        - Personal wellbeing and work-life balance
        
        Include specific times, categories (like "Classroom Setup", "Curriculum Planning", "Student Relations", "Parent Communication", "Professional Development", "Self-Care"), activities, and the purpose/benefit of each activity.
        
        Respond with ONLY a JSON array like this:
        [
          {"time": "7:00 AM - 8:00 AM", "category": "Classroom Setup", "activity": "Arrange desks for collaborative learning and post welcome messages", "purpose": "Create welcoming, functional learning environment"},
          {"time": "9:00 AM - 10:00 AM", "category": "Student Relations", "activity": "Plan ice-breaker activities to learn student names and interests", "purpose": "Build classroom community and assess student needs"},
          {"time": "3:30 PM - 4:30 PM", "category": "Parent Communication", "activity": "Draft welcome letter to parents with classroom expectations", "purpose": "Establish positive home-school communication"}
        ]`
    };

    const prompt = rolePrompts[role] || rolePrompts.student;

    // Query AI with comprehensive back-to-school context
    const aiResponse = await queryHerokuAI(prompt);

    // Parse the response into a clean array
    const schedule = parseScheduleFromAI(aiResponse);

    console.log(chalk.green(`✅ Back-to-school ${role} plan for ${phase}:`), schedule);

    return {
        schedule,
        phase,
        phaseDescription,
        challenges: relevantChallenges.slice(0, 3), // Top 3 challenges being addressed
        nextPhase: getNextPhase(phase)
    };
}

function getNextPhase(currentPhase) {
    const phases = ["2_weeks_before", "1_week_before", "first_week", "first_month"];
    const currentIndex = phases.indexOf(currentPhase);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
}

export { backToSchoolPlannerAgent as plannerAgent };
