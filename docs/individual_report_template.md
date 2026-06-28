# SDGP CW 1: Individual Report Template

This document is the Markdown template for the **Individual Report** (Chapters 4 to 6). Copy this content into your text editor or Google Docs, and compile according to the Westminster Harvard formatting guidelines (Times New Roman, justified margins, chapter-based section headers).

---

# Cover Page

**UNIVERSITY OF WESTMINSTER**  
**INFORMATICS INSTITUTE OF TECHNOLOGY (IIT)**  

**MODULE TITLE:** Software Development Group Project  
**MODULE CODE:** 5COSC021C  
**PROJECT NAME:** [Insert Project Title, e.g., Secure Quiz Web Application MVP]  
**REPORT TYPE:** Individual Report (Chapters 4 - 6)  

**STUDENT DETAILS:**  
*   **Name:** [Student Name]  
*   **IIT ID:** [IIT Student ID]  
*   **UoW ID:** [University of Westminster ID]  

**MODULE LEADER:** Banuka Athuraliya  
**DATE OF SUBMISSION:** January 8, 2024  

*(Note: The cover page must not contain a page number)*

---
\pagebreak

# Declaration Page

I hereby declare that this Software Development Group Project individual report coursework contribution containing Chapters 4, 5, and 6 is my own original work carried out under the module 5COSC021C: Software Development Group Project. All sources, comparisons, references, and benchmarks used in this documentation have been explicitly cited and referenced using the Westminster Harvard referencing standard.

**Student Signature:**  

___________________________ ([Student Name]) - Date: ______________

*(Note: Lowercase Roman numeral page numbering starts here: Page i)*

---
\pagebreak

# Abstract

[Insert a concise abstract summarizing your individual contributions, specifically focusing on the System Requirements Specification, SLEP analysis, and System Architecture and Design implementations of the MERN stack Quiz application. Keep it between 150 to 250 words.]

**Keywords:** Requirements Elicitation, Use Case Description, BCS Code of Conduct, GDPR, MERN 3-Tier, UML Modeling.

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

# Chapter 4: System Requirements Specification (SRS)

## 4.1 Chapter Overview
This chapter defines the system requirements, details the project stakeholders using the Onion model, analyzes requirement elicitation results, outlines use cases, and lists functional and non-functional requirements.

## 4.2 Stakeholder Analysis

### 4.2.1 Onion Model
[Insert Onion Model diagram mapping Core Actors, System Operators, and External Beneficiaries.]

### 4.2.2 Stakeholder Descriptions

| Stakeholder | Viewpoint |
| :--- | :--- |
| **Functional Beneficiary** | **Students**: Desires an intuitive, responsive interface with a synced exam timer and score logging. |
| **Financial Beneficiary** | **Educational Institution (IIT/UoW)**: Acknowledges efficiency in secure, low-overhead testing environments. |
| **Social Beneficiary** | **Instructors**: Focuses on easy category management, quiz editing, and cheat prevention. |
| **Operational Beneficiary** | **System Operators**: Administers the MongoDB server and handles JWT token allocations. |
| **Negative Stakeholders** | **Malicious Actors**: Attempts to bypass route guards or sniff quiz correctness keys. |
| **Regulatory** | **Module Evaluators**: Validates academic integrity and module compliance. |
| **Experts** | **Security Inspectors**: Audits token authentication and database connection safety. |
| **Neighboring Systems** | **SMTP Email Provider**: Receives transaction triggers to forward login verification OTPs. |

## 4.3 Selection of Requirement Elicitation Techniques
[Explain why specific requirement elicitation methods were chosen, such as questionnaires, client interviews, and prototype observation.]

## 4.4 Discussion / Analysis of Results
[Present and analyze the results gathered from elicitation sessions, explaining how these results shaped the application requirements.]

## 4.5 Use Case Diagram
[Insert the UML Use Case Diagram mapping student play options and admin configuration procedures.]

## 4.6 Use Case Descriptions

### UC-001: Submit Quiz Attempt

| Field | Details |
| :--- | :--- |
| **Use Case Name** | Submit Quiz Attempt |
| **Use Case ID** | UC-001 |
| **Description** | Allows a student actor to submit their answers for scoring and logging. |
| **Priority** | Critical |
| **Primary Actor** | Student |
| **Supporting Actors** | Database System |
| **Pre-Conditions** | Student has an active authenticated session and is playing an active quiz attempt. |
| **Trigger** | The student clicks the "Submit" button, or the play timer reaches 0. |
| **Main Flow** | 1. The client compiles the answer selections list.<br>2. The client transmits the payload to `POST /api/student/quizzes/:quizId/submit`.<br>3. The backend database calculates correct options server-side.<br>4. The backend registers the score attempt in MongoDB.<br>5. The client redirects to `Results.tsx` displaying the scorecard. |
| **Exception Flow** | Connection timeout: The system retries connection or displays a warning state. |
| **Alternate Flow** | Timer expires: The system automatically submits current selections. |
| **Exclusions** | None |
| **Post Conditions** | An attempt document is saved in MongoDB. The student is shown their score. |

## 4.7 Functional Requirements (MOSCOW Prioritized)

| ID | Requirements List | Priority Level | Description |
| :--- | :--- | :--- | :--- |
| **FR-01** | Student Authentication & Verification | Critical | Users must register and log in securely, verifying their email through a 2FA OTP code. |
| **FR-02** | Secure Server-Side Grading | Critical | The system must validate student submissions on the backend and never send answer keys to the client. |
| **FR-03** | Quiz Configuration Panel | Critical | Admins must be able to create, read, update, and delete quiz configurations and questions. |
| **FR-04** | Synchronized Countdown Timers | Critical | The interactive play page must show a count-down timer matching the quiz limit configuration. |
| **FR-05** | Historical Performance Log | Desirable | Students must be able to review their score records and attempt histories on their dashboard. |
| **FR-06** | Quiz Leaderboard | Desirable | The system must calculate and rank student attempts to show a quiz leaderboard. |

## 4.8 Non-Functional Requirements
*   **Security (NFR-01)**: User passwords must be hashed using bcrypt (10 rounds). API endpoints must be guarded with JWT bearer tokens.
*   **Reliability (NFR-02)**: The server must handle database reconnection attempts without crashing the Node.js application process.
*   **Performance (NFR-03)**: API routing validation and score calculations must execute in under 200ms.
*   **Usability (NFR-04)**: The application must offer an intuitive, fully responsive user interface utilizing consistent styling.

## 4.9 Chapter Summary
This chapter defined the system requirements, detailed the use case specifications, and prioritized functional and non-functional requirements.

---
\pagebreak

# Chapter 5: Social, Legal, Ethical & Professional Issues (SLEP)

## 5.1 Chapter Overview
This chapter analyzes the system's compliance with professional codes of conduct, data security policies, and ethical standards.

## 5.2 Dataset Ethical Clearance
[Document the licensing and origins of seed questions or user database records. If using open repositories like Kaggle, cite the appropriate open-source licenses, such as Creative Commons CC0.]

## 5.3 SLEP Issues and Mitigation (BCS Code mapping)
[Analyze project decisions using the British Computer Society (BCS) Code of Conduct principles.]

1.  **Public Interest**:
    *   *Analysis*: Preventing cheating by securing answer keys protects the integrity of academic scores and certifications.
2.  **Duty to Relevant Authority**:
    *   *Analysis*: GDPR compliance requires securing student emails and encrypting passwords via bcrypt salting.
3.  **Duty to the Profession**:
    *   *Analysis*: Follow industry best practices by writing secure code, maintaining documentation, and creating TypeScript type declarations.
4.  **Professional Competence and Integrity**:
    *   *Analysis*: Implement Jest integration tests to verify code stability before deploying services.

## 5.4 Chapter Summary
This chapter verified that the Quiz application complies with GDPR and BCS standards, addressing security, data safety, and ethical concerns.

---
\pagebreak

# Chapter 6: System Architecture & Design

## 6.1 Chapter Overview
This chapter presents the architecture of the application, details the data model, and outlines core system behaviors using UML diagrams.

## 6.2 System Architecture Design
The application is structured as a MERN 3-tier layered system:
*   **Presentation Tier**: React SPA built with Vite and Tailwind CSS.
*   **Logic Tier**: Node.js/Express REST server.
*   **Data Tier**: MongoDB Database.

[Insert the System Architecture Diagram detailing boundaries, routes, and data flows.]

## 6.3 System Design

### 6.3.1 Class Diagram
[Insert the Class Diagram detailing classes, fields, methods, and relationships, based on the backend Mongoose models.]

### 6.3.2 Sequence Diagram
[Insert a Sequence Diagram showing the sequence of a student retrieving a quiz, selecting choices, and submitting answers for grading.]

### 6.3.3 Activity Diagram
[Insert an Activity Diagram mapping the registration, login, and 2FA OTP verification flows.]

### 6.3.4 UI Design and Mockups
[Insert low-fidelity wireframes or high-fidelity mockups of the Student Dashboard, Admin Quiz Configuration panel, and the Gameplay Arena.]

## 6.4 Chapter Summary
This chapter outlined the system's structural design, mapping core collections, interfaces, sequencing flows, and user interfaces.

---
\pagebreak

# References

*(Note: Page numbering changes to Uppercase Roman numerals here, e.g., Page I)*

[List all references in alphabetical order using the Westminster Harvard Referencing Style.]

---
\pagebreak

# Appendix

*   **Appendix A**: [Provide description, e.g., Use Case Scenario Mock Logs]
*   **Appendix B**: [Provide description, e.g., UI Styling Guidelines]
