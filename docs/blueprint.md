# **App Name**: SkillMach AI

## Core Features:

- Machine Management & Real-time Status: Admins can add, edit, and view machine details (ID, name, type, location, status, usage hours, last maintenance date, health score) on a dashboard that shows real-time machine availability and status updates.
- Machine Booking System: Students can reserve machines for specific time slots, with checks in place to prevent double-booking. Includes fields for student name, machine ID, center, time slot, and purpose.
- AI Assistant (AI Zaya): An interactive chatbot assistant, powered by Google Gemini API, capable of answering student queries, suggesting available machines, summarizing training manuals, explaining machine operation, troubleshooting machine problems, and generating training instructions.
- Predictive Maintenance AI: An AI tool that analyzes usage hours, machine temperature, vibration data, and maintenance history to predict potential machine failures. It generates automated alerts for upcoming maintenance needs, e.g., 'Machine CNC-12 may require maintenance within 5 days.'
- Analytics Dashboard: An administrative dashboard providing insights into machine utilization percentages, identification of most used and idle machines, maintenance frequency, and center performance comparisons, visualized with bar, pie, and line charts.
- Multi-Center & Role-Based Access Management: Support for managing machinery across multiple skill development centers and implements a robust role-based access control system for Admins, Trainers, and Students, defining specific permissions for each role.
- Maintenance Ticket System: A system to automatically create maintenance tickets when machines report abnormal behavior or based on predictive AI alerts. Tickets include machine ID, issue, priority, assigned technician, and status.

## Style Guidelines:

- A sophisticated dark theme palette. The primary color is a vibrant tech-blue, '#2F88F8' (HSL: 220, 80%, 60%), representing clarity and innovation. The background color is a deep, subtle blue-grey '#1F252E' (HSL: 220, 20%, 15%), providing a focused environment. The accent color is a striking violet, '#6F2FF8' (HSL: 250, 70%, 50%), to highlight key interactions and alerts.
- Headlines use 'Space Grotesk' (sans-serif) for a modern, techy aesthetic, while body text and data are rendered in 'Inter' (sans-serif) for optimal legibility and a neutral, objective feel, suitable for data-driven displays.
- Utilize modern, clean, and functional vector icons, consistent with Shadcn UI components, to convey actions and statuses clearly. Icons should be easily discernible within the dark theme.
- The layout features a responsive, multi-column dashboard design, optimized for various screen sizes, including a dedicated 3-dot mobile menu drawer for intuitive navigation on smaller devices. Data presentation will prioritize clarity and hierarchy.
- Subtle and purposeful animations should be used for state changes, data loading, and transitions between sections. Animations will be swift and provide clear feedback without distracting from critical information, enhancing user experience in data-rich environments.