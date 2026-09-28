import os

class SimpleLanguageService:
    def __init__(self):
        pass

    def simplify_text(self, text, language="English"):
        if not text:
            return ""

        # Simple replacements
        simplified = text
        replacements = {
            "economically weaker sections": "families with lower annual income",
            "micro-enterprises": "small shops, workshops or home businesses",
            "credit-linked subsidy": "bank loan with a cash grant discount paid by government",
            "collateral-free": "no property, house, or land needed as security deposit",
            "greenfield enterprise": "a completely new business starting from scratch",
            "concessional rate of interest": "very low interest rate",
            "disbursement": "releasing loan money into your bank account",
            "moratorium period": "grace period where you don't have to start paying back loan EMIs",
            "margin money": "the small portion of money you contribute yourself"
        }

        for orig, simple in replacements.items():
            simplified = simplified.replace(orig, simple)
            simplified = simplified.replace(orig.capitalize(), simple.capitalize())

        return simplified