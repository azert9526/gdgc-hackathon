from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from collections import defaultdict

class PrivacyProxy:
    def __init__(self):
        self.analyzer = AnalyzerEngine()

        api_key_pattern = Pattern(name="api_key_pattern", regex=r"sk-[a-zA-Z0-9]+", score=1.0)
        api_key_recognizer = PatternRecognizer(supported_entity="API_KEY", patterns=[api_key_pattern])
        self.analyzer.registry.add_recognizer(api_key_recognizer)

        self.target_entities = [
            "PERSON",
            "EMAIL_ADDRESS",
            "LOCATION",
            "PHONE_NUMBER",
            "CREDIT_CARD",
            "API_KEY"
        ]

    def mask_prompt(self, text: str):
        results = self.analyzer.analyze(text=text, entities=self.target_entities, language="en")

        results.sort(key=lambda x: x.start, reverse=True)

        masked_text = text
        mapping_dict = {}
        entity_counts = defaultdict(lambda: 1)

        for res in results:
            entity_type = res.entity_type
            original_value = text[res.start:res.end]

            tag = f"[{entity_type}_{entity_counts[entity_type]}]"
            entity_counts[entity_type] += 1

            mapping_dict[tag] = original_value

            masked_text = masked_text[:res.start] + tag + masked_text[res.end:]

        return masked_text, mapping_dict

    def unmask_response(self, llm_response: str, mapping_dict: dict):
        unmasked_text = llm_response

        for tag, original_value in mapping_dict.items():
            unmasked_text = unmasked_text.replace(tag, original_value)

        return unmasked_text