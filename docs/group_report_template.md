# SDGP CW 1: Group Report Template

This document is the Markdown template for the **Group Report** (Chapters 1 to 3). Copy this content into your text editor or Google Docs, and compile according to the Westminster Harvard formatting guidelines (Times New Roman, justified margins, chapter-based section headers).

---

# Cover Page

**UNIVERSITY OF WESTMINSTER**  
**INFORMATICS INSTITUTE OF TECHNOLOGY (IIT)**  

**MODULE TITLE:** Software Development Group Project  
**MODULE CODE:** 5COSC021C  
**PROJECT NAME:** [Insert Project Title, e.g., Secure Quiz Web Application MVP]  
**TEAM NAME:** [Insert Team Name, e.g., IIT - SE-01]  

**TEAM MEMBERS:**  
*   [Student 1 Name] - [IIT ID] - [UoW ID]  
*   [Student 2 Name] - [IIT ID] - [UoW ID]  
*   [Student 3 Name] - [IIT ID] - [UoW ID]  
*   [Student 4 Name] - [IIT ID] - [UoW ID]  

**MODULE LEADER:** Banuka Athuraliya  
**DATE OF SUBMISSION:** January 8, 2024  

*(Note: The cover page must not contain a page number)*

---
\pagebreak

# Declaration Page

We, the undersigned, hereby declare that this Software Development Group Project coursework report titled "[Insert Project Title]" is our own original work carried out under the module 5COSC021C: Software Development Group Project. All sources, comparisons, references, and benchmarks used in this documentation have been explicitly cited and referenced using the Westminster Harvard referencing standard.

**Student Signatures:**  

*   ___________________________ ([Student 1 Name]) - Date: ______________
*   ___________________________ ([Student 2 Name]) - Date: ______________
*   ___________________________ ([Student 3 Name]) - Date: ______________
*   ___________________________ ([Student 4 Name]) - Date: ______________

*(Note: Lowercase Roman numeral page numbering starts here: Page i)*

---
\pagebreak

# Abstract

[Insert a concise abstract summarizing the problem, the proposed MERN stack Quiz application solution, methodologies adopted, and key outcomes. Keep it between 150 to 250 words.]

**Keywords:** MERN Stack, MongoDB, Express, React, Node.js, Secure Grading, Anti-Cheating, 2FA, OTP.

---
\pagebreak

# Acknowledgements

[Insert acknowledgements to course instructors, module leader, mentors, and fellow team members who facilitated the execution of this project.]

---
\pagebreak

# Table of Contents
*(Placeholder: Generate automatically inside MS Word under References -> Table of Contents)*

# List of Figures
*(Placeholder: Generate automatically inside MS Word under References -> Insert Table of Figures)*

# List of Tables
*(Placeholder: Generate automatically inside MS Word under References -> Insert Table of Figures)*

---
\pagebreak

# Abbreviations Table

| Abbreviation | Full Form |
| :--- | :--- |
| **API** | Application Programming Interface |
| **BCS** | British Computer Society |
| **DBMS** | Database Management System |
| **GDPR** | General Data Protection Regulation |
| **JWT** | JSON Web Token |
| **MERN** | MongoDB, Express.js, React, Node.js |
| **MVP** | Minimum Viable Product |
| **ODM** | Object Document Mapper |
| **OTP** | One-Time Password |
| **SLEP** | Social, Legal, Ethical, and Professional |
| **SRS** | System Requirements Specification |
| **UI/UX** | User Interface / User Experience |
| **WBS** | Work Breakdown Structure |

---
\pagebreak

# Chapter 1: Introduction

## 1.1 Chapter Overview
This chapter provides an introduction to the project, outlining the background of the problem, the core challenges, the proposed solution, objectives, and scope limits.

## 1.2 Problem Background
[Insert detailed context regarding online testing solutions, issues of security, cheating, database query sniff checks, and latency. Include statistics, examples, and citations.]

## 1.3 Problem Statement
The primary challenge lies in the lack of security and cheat prevention in standard web-based quiz tools, where answer keys are often inspectable in the frontend DOM or network payloads, and 2FA authentication is absent.

## 1.4 Proposed Solution
A secure MERN-stack quiz system implementing backend grading algorithms, dynamic timer checks, verification filters to project option correctness queries, and OTP-guarded authentication.

## 1.5 Project Aim
*The primary aim of this project is to develop and evaluate a secure, high-performance web-based quiz application that prevents client-side answer key interception and incorporates robust authentication workflows.*

[Elaborate on the aim so that the reader understands the broad goals of the project.]

## 1.6 Project Scope
The scope defines what is included and excluded from the Minimum Viable Product.

### 1.6.1 In-scope
*   Role-based user registration and 2FA login (Student, Admin, SuperAdmin).
*   Admin dashboard panels to configure categories, quizzes, and questions.
*   Student interactive play module with synchronous count-down timers.
*   Server-side answer key validation (never sent to client).
*   Score tracking and leaderboard generation.

### 1.6.2 Out-scope
*   Payment processing for paid quizzes.
*   Real-time multiplayer lobbies.
*   Integration with external Learning Management Systems (LMS) like Canvas.

## 1.7 Rich Picture Diagram
[Insert Rich Picture Diagram depicting roles, actions, server interactions, email deliveries, and database operations.]

## 1.8 Resource Requirements

### 1.8.1 Hardware Requirements
*   Development workstations (Minimum 8GB RAM, Core i5 Processor or equivalent).
*   Hosting server infrastructure (e.g., AWS, Render, or local staging instances).

### 1.8.2 Software Requirements
*   **Backend**: Node.js, Express.js, Mongoose ODM.
*   **Frontend**: React, Vite, Tailwind CSS, Axios.
*   **Database**: MongoDB.
*   **Collaboration/Tools**: Visual Studio Code, Git, GitHub, Trello, Slack.

### 1.8.3 Data Requirements (Optional)
*   Seed data trivia sets containing categories, questions, and multiple-choice answer items.

## 1.9 Business Model Canvas
[Insert completed Business Model Canvas describing key partners, value propositions, channels, customer relations, structures, and streams.]

## 1.10 Chapter Summary
This chapter laid the groundwork for the project by defining the problem, scope parameters, aims, resource requirements, and business viability models.

---
\pagebreak

# Chapter 2: Existing Work

## 2.1 Chapter Introduction
This chapter benchmarks existing educational platforms, reviews technology stack configurations, and discusses verification algorithms.

## 2.2 Existing Work / Competitor Comparison
[Benchmark standard tools like Kahoot, Quizizz, and Canvas. Provide a feature matrix comparison highlighting secure grading, network data leaks, OTP logic, and responsiveness.]

| Feature / Tool | Kahoot | Quizizz | Canvas LMS | Proposed Quiz App MVP |
| :--- | :--- | :--- | :--- | :--- |
| **Secure Grading** | Yes | Yes | Yes | Yes (Server-Side) |
| **Excludes Answer Keys in Client** | Yes | No | Yes | Yes (Strict Projections) |
| **Built-in 2FA OTP** | No | No | Optional | Yes (Mandatory for Admin) |
| **Custom Category Config** | Yes | Yes | Yes | Yes |

## 2.3 Tools and Implementation Plan
[Analyze backend and frontend options. Discuss the trade-offs of using MERN (Express + MongoDB) vs traditional options (Django + SQL). Detail why embedded MongoDB options lists fit MCQs better than SQL relational joins.]

## 2.4 Chapter Summary
This chapter analyzed competitor offerings, establishing standard benchmarks, and justified using MERN stack tools for the implementation phase.

---
\pagebreak

# Chapter 2: Methodology

## 3.1 Chapter Overview
This chapter details the development life cycle, design practices, project management tools, schedules, and risk matrix.

## 3.2 Development Methodology
[Describe the selected Agile/Scrum or prototyping model. Explain the sprints, backlog refinement, and justification for rapid MVP iteration.]

## 3.3 Design Methodology
[Detail the use of Object-Oriented Analysis and Design (OOAD) with UML diagrams.]

## 3.4 Project Management Methodology
[Analyze Scrum. Discuss daily standups, backlog management, and sprint reviews.]

## 3.5 Team Work Breakdown Structure (WBS)
[Outline task distributions and individual student assignments.]

*   **Student 1**: Backend services, models, and grading calculations.
*   **Student 2**: Frontend layout, routing, guards, and context APIs.
*   **Student 3**: Integration testing, schemas, and QA processes.
*   **Student 4**: Requirement elicitation, UI/UX mockups, and documentation.

## 3.6 Gantt Chart Diagram
[Insert a Gantt chart detailing tasks, milestones, timelines, and dependencies.]

## 3.7 Collaboration Software Proofs
[Provide screenshots of Slack threads, weekly agendas, Trello boards, and GitHub commits to prove team collaboration.]

## 3.8 Risks and Mitigation
[Detail project, operational, and technical risks.]

| Risk Item | Severity | Frequency | Mitigation Plan |
| :--- | :--- | :--- | :--- |
| **Database Downtime** | High | Low | Implement retry connection middleware hooks. |
| **Key Developer Absence** | Medium | Medium | Maintain cross-functional pair-programming checks. |
| **Scope Creep** | High | Low | Strictly align execution checkpoints with the MVP backlog. |

## 3.9 Chapter Summary
This chapter discussed development models, division of tasks, schedules, and risk planning metrics to ensure successful delivery.

---
\pagebreak

# References

*(Note: Page numbering changes to Uppercase Roman numerals here, e.g., Page I)*

[List all references in alphabetical order using the Westminster Harvard Referencing Style.]

*   Example: Fowler, M., 2004. *UML Distilled: A Brief Guide to the Standard Object Modeling Language*. 3rd ed. Boston: Addison-Wesley.

---
\pagebreak

# Appendix

*   **Appendix A**: [Provide description, e.g., Initial Meeting Minutes]
*   **Appendix B**: [Provide description, e.g., Survey Results]
