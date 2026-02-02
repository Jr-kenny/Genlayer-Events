# Genlayer Events

A dedicated webpage showcasing all community activities from the Genlayer Discord, including quizzes, games, community meetings, and more.

## Overview

Genlayer Events is a web platform designed to keep the community informed about ongoing and upcoming activities. The platform provides an organized view of all Discord community events with easy access to current, future, and historical event information.

## Structure

The platform consists of two main pages:

### Live & Upcoming Events Page
Displays events that are:
- Currently happening (live events)
- Scheduled for the future

### Past Events Page
Archives completed events for:
- Reference purposes
- Community history preservation

## Event Data Source

The project uses an intelligent contract-based data management system:

### Architecture
1. **Data Storage**: Google Sheets serves as the primary data source
   - [Event Data Spreadsheet](https://docs.google.com/spreadsheets/d/1xApbva-e21uyLo72mps_YFyfybVCVRrDw-uq7wXJsds/edit?usp=sharing)
   - Can be updated from phone or anywhere with internet access

2. **Intelligent Contract**: Reads the Google Sheets data
   - Processes the spreadsheet information
   - Outputs data as JSON format

3. **Frontend**: Fetches the JSON data from the intelligent contract
   - Displays events in a user-friendly interface
   - Auto-updates when new data is available

### Benefits of This Approach
- ✅ Easy updates from any device
- ✅ No direct database management required
- ✅ Accessible data source for event organizers
- ✅ Automated data pipeline via intelligent contract


## GenLayer Events: Building a Decentralized Community Oracle

This time around, I thought about the friction in community management. Usually, keeping a community informed about Discord events involves a heavy dance between manual database entries, private servers, and static websites. I wanted to see if I could use an **Intelligent Contract** to turn a simple, everyday tool—a Google Sheet—into a verified, on-chain data source.

The goal was to build a platform where the data is easy to update (from a phone or a spreadsheet) but is managed and served by a decentralized "brain" that ensures the information is structured, transparent, and always available to the frontend.

### How I’m Making it Work

**1. The "Dumb" Source to "Smart" Data**
Instead of building a complex backend or managing a private database, I’m using a Google Sheet as the primary source. Anyone with permission can update it on the fly. The contract then acts as a **Decentralized Oracle**. It doesn't just "copy" the data; it **interprets** it. This means event organizers don't need to know how to code; they just update a row, and the contract handles the rest.

**2. The Sync Mechanism (Write Function)**
This is where the heavy lifting happens. When the `sync_events` function is called, the contract performs a live web fetch using `gl.nondet.web.get`.

* **The Extraction:** Raw spreadsheet data is messy. The contract uses GenLayer’s internal AI to "read" the spreadsheet content and extract titles, dates, and descriptions into a perfectly structured JSON object.
* **The Cleaning:** I’ve implemented a standardized cleaning process within the contract. It strips out AI "thoughts," removes markdown formatting, and isolates the raw JSON so the frontend doesn't have to do any guesswork or heavy processing.

**3. The Storage & View**
Once the sync is complete, the `events_data` is saved directly into the contract’s state. This turns a temporary spreadsheet list into a piece of community history that is preserved on the ledger. The frontend then pulls this data via a simple View function, ensuring the site is always in sync without needing a middleman server.

---

### The Power of the Non-Comparative Equivalence Principle

The most critical part of this build is how the network reaches consensus on the data. For this, I am using the **Non-Comparative Equivalence Principle**.

When you’re fetching data from the web, things get "noisy." LLMs are non-deterministic, meaning two different validators might get the same facts but format the JSON with different spacing or slightly different date strings. In a traditional blockchain, this minor variation would cause a "disagreement" (fork), making it impossible to store the data reliably.

**My implementation solves this through "Semantic Truth":**

* **The Task:** I’ve set a clear mission for the validators: *"Extract spreadsheet records into a structured JSON format."*
* **The Criteria:** I defined a specific set of standards. Validators are instructed to ignore date/time format differences or JSON whitespace.
* **Definition of Failure:** To make the system robust, I explicitly defined failure. Validators only vote **DISAGREE** if the leader sends *no* factual information from the spreadsheet at all. If the semantic meaning is correct, they vote **AGREE**.

### Why this is a Game Changer

This approach creates a **Trustless Data Pipeline**. It allows us to use the flexibility of the web (Google Sheets) while maintaining the integrity of the blockchain.

By using the **Non-Comparative Equivalence Principle**, the process is lean and cost-effective. We don't need every validator to replicate the entire heavy AI extraction; they just need to "double-check" that the Leader’s output accurately reflects the truth of the spreadsheet. It turns the contract into a "Security Guard" for the community's information, ensuring that what you see on the site is exactly what was intended, verified by a decentralized network.


