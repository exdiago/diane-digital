# Diane Digital - Your Empathetic AI Health Assistant

## 🚀 Project Overview

Diane Digital is a proof-of-concept AI-powered digital human designed to provide empathetic, knowledgeable, and trustworthy support to Spanish-speaking women managing prediabetes and diabetes. She serves as a welcoming presence on a website, capable of engaging in natural, bilingual conversations and answering questions based on a verified, private knowledge base.

This project was built for the Bolt.new Hackathon, leveraging a modern, full-stack JavaScript environment to create a seamless and authentic user experience.

---

## ✨ Core Features & Philosophy

Diane Digital is built on a foundation of trust and authenticity. We've implemented several key features to ensure she is a safe and reliable resource:

* **Bilingual & Spanish-First:** The interface is designed to be welcoming to a Spanish-speaking audience, while the AI can seamlessly switch between Spanish and English based on the user's language.
* **Powered by Your Knowledge:** Diane's intelligence comes exclusively from a private `knowledge_base` folder containing articles, PDFs, and transcripts. This is achieved through a **Retrieval-Augmented Generation (RAG)** architecture.
* **No Hallucinations:** By design, the AI is instructed to only answer questions if the information exists within the provided knowledge base. If it doesn't know an answer, it will honestly say so, preventing it from inventing information.
* **Guaranteed Responses:** Critical questions about the avatar's nature (e.g., "How are you different from ChatGPT?", "What about privacy?") are handled by a keyword-detection system that provides a pre-written, guaranteed-correct answer.
* **Video Persona:** Every response is delivered by a `Tavus` video replica, creating a human-like connection that goes beyond simple text chat.

---

## 🛠️ Tech Stack

This project utilizes a modern, powerful stack to deliver a real-time conversational experience.

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express
* **AI Brain:** OpenAI (GPT-4o) for Natural Language Understanding and response generation.
* **AI Persona & Voice:** Tavus for generating a video replica with perfectly synchronized voice and lip movements.
* **Development Environment:** VS Code
* **Hackathon Platform:** Bolt.new for cloud-based development and submission.

---

## ⚙️ Running the Project Locally

To get Diane Digital running on your local machine, follow these steps:

### 1. Prerequisites

* Node.js (LTS version) installed.
* A code editor like VS Code.

### 2. Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/exdiago/diane-digital.git](https://github.com/exdiago/diane-digital.git)
    cd diane-digital
    ```

2.  **Install Dependencies:**
    This project is a monorepo. Run the installation from the root directory.
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    * Create a `.env` file in the root of the project.
    * Use the `.env.example` file as a template and fill in your secret keys for OpenAI and Tavus.

    ```
    # .env
    OPENAI_API_KEY="sk-..."
    TAVUS_API_KEY="key_..."
    TAVUS_REPLICA_ID="replica_..."
    ```

4.  **Populate the Knowledge Base:**
    * Add your `.txt` and `.pdf` files to the `knowledge_base` directory.

### 3. Run the Application

* Start both the frontend and backend servers concurrently with a single command:
    ```bash
    npm run dev
    ```
* Your browser should open automatically to `http://localhost:5173`.

---

## 🚀 Hackathon Submission

This project is designed to be run on Bolt.new. The submission link is:

**[https://bolt.new/github.com/exdiago/diane-digital](https://bolt.new/github.com/exdiago/diane-digital)**




