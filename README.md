# Diane Digital - Your Empathetic AI Health Assistant

## 🚀 Project Overview

Diane Digital is a proof-of-concept AI-powered digital human designed to provide empathetic, knowledgeable, and trustworthy support to Spanish-speaking women managing prediabetes and diabetes. She serves as a welcoming presence on a website, capable of engaging in natural, bilingual conversations and answering questions based on a verified, private knowledge base.

This project was built for the Bolt.new Hackathon, leveraging a modern, full-stack JavaScript environment to create a seamless and authentic user experience.

---

##  जज To Hackathon Judges: One-Time Setup Required

Thank you for reviewing Diane Digital! Because this application uses secure API keys that cannot be stored in a public GitHub repository, a one-time manual setup is required after you open the Bolt.new link.

**Please follow these steps to make the application functional:**

1.  **Open `server/index.js`:** In the Bolt.new code editor, navigate to the `server/index.js` file.
2.  **Paste API Keys:** At the top of the file, you will see a section marked `--- API KEYS: PASTE YOUR SECRETS HERE ---`. Please paste the provided API keys for OpenAI and Tavus into the placeholder strings.
3.  **Restart the Server:** Go to the **Terminal** window within Bolt, stop any running process with `Ctrl + C`, and restart the application by running the command `npm run dev`.

The application will now be fully functional. Thank you!

---

## ✨ Core Features & Philosophy

Diane Digital is built on a foundation of trust and authenticity. We've implemented several key features to ensure she is a safe and reliable resource:

* **Bilingual & Spanish-First:** The interface is designed to be welcoming to a Spanish-speaking audience, while the AI can seamlessly switch between Spanish and English based on the user's language.
* **Powered by Your Knowledge:** Diane's intelligence comes exclusively from a private `knowledge_base` folder containing articles and text files. This is achieved through a **Retrieval-Augmented Generation (RAG)** architecture.
* **No Hallucinations:** By design, the AI is instructed to only answer questions if the information exists within the provided knowledge base. If it doesn't know an answer, it will honestly say so, preventing it from inventing information.
* **Guaranteed Responses:** Critical questions about the avatar's nature are handled by a keyword-detection system that provides a pre-written, guaranteed-correct answer.
* **Video Persona:** Every response is delivered by a `Tavus` video replica, creating a human-like connection that goes beyond simple text chat.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS
* **Backend:** Node.js, Express
* **AI Brain:** OpenAI (GPT-4o)
* **AI Persona & Voice:** Tavus
* **Development Environment:** VS Code
* **Hackathon Platform:** Bolt.new

---

## ⚙️ Running the Project Locally

1.  **Clone the Repository:** `git clone https://github.com/exdiago/diane-digital.git`
2.  **Install Dependencies:** `npm install`
3.  **Configure `.env`:** Create a `.env` file using `.env.example` as a template and add your API keys.
4.  **Populate Knowledge Base:** Add `.txt` or `.md` files to the `knowledge_base` folder.
5.  **Run:** `npm run dev`

---

## 🚀 Hackathon Submission Link

**[https://bolt.new/github.com/exdiago/diane-digital](https://bolt.new/github.com/exdiago/diane-digital)**
