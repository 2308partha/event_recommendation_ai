from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from recommendation.chains.prompt_templates import recommendation_prompt

def get_scoring_chain():
    """
    Constructs the LangChain Expression Language (LCEL) chain.
    Enforces structured JSON output parsing directly from the Gemini API.
    """
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    # Clean LCEL structure: Prompt Template -> Gemini API -> JSON Output Parser
    return recommendation_prompt | llm | JsonOutputParser()