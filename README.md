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
