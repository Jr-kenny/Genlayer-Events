# { "Depends": "py-genlayer:latest" }
import genlayer.gl as gl
import re
import json

class EventSyncContract(gl.Contract):
    spreadsheet_url: str
    events_data: str

    def __init__(self, spreadsheet_url: str):
        self.spreadsheet_url = spreadsheet_url
        self.events_data = "{}"

    @gl.public.write
    def sync_events(self) -> str:
        url_to_fetch = self.spreadsheet_url

        # Refined Task and Criteria for Validators [3, 4]
        task = "Extract spreadsheet records into a structured JSON format."
        
        # Explicit definition of failure: Only disagree if NO data is sent [5]
        criteria = (
            "A proposal is EQUIVALENT if it satisfies these standards:\n"
            "1. SEMANTIC TRUTH: Ignore date/time format differences or JSON whitespace.\n"
            "2. HANDLE EMPTY CELLS: Missing data can be null, empty strings, or omitted.\n"
            "3. DEFINITION OF FAILURE: Only vote DISAGREE if the leader sends NO factual "
            "information from the spreadsheet at all. If any record is correct, vote AGREE."
        )

        # This function fetches, extracts, and cleans the data [1]
        def get_extracted_and_cleaned_data():
            # Independent fetch ensures validators have the same source truth [6]
            spreadsheet_content = gl.nondet.web.get(url_to_fetch).body
            
            prompt = (
                "Extract events from this spreadsheet into JSON.\n"
                "Structure: { \"events\": [ { \"title\": \"str\", \"date\": \"str\" ... } ] }\n"
                f"Data: {spreadsheet_content}"
            )
            raw_res = gl.nondet.exec_prompt(prompt)
            
            # standardized cleaning to isolate JSON [7-9]
            clean = re.sub(r'<thought>.*?</thought>', '', raw_res, flags=re.DOTALL)
            clean = clean.replace("```json", "").replace("```", "").strip()
            start, end = clean.find('{'), clean.rfind('}') + 1
            return clean[start:end] if start != -1 else clean

        # FIXED: Removed 'input=' to pass the function positionally
        self.events_data = gl.eq_principle.prompt_non_comparative(
            get_extracted_and_cleaned_data,
            task=task,
            criteria=criteria
        )

        return self.events_data

    @gl.public.view
    def read_events(self) -> str:
        return self.events_data
