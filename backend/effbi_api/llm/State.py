class State:
    def __init__(self):
        self.uuid = ""
        self.question = ""
        self.parsed_question = {}
        self.database_schema = {}
        self.is_relevant = False
        self.sql_issues = []
        self.sql_query = ""
        self.results = []
        self.formatted_data = {}
        self.visualization = ""
        self.visualization_reasoning = ""