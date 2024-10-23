import json
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from .LLMManager import LLMManager
from .State import State

from enum import Enum


class ChartType(Enum):
    AreaChartTemplate = "AreaChartTemplate"

    LineChartTemplate = "LineChartTemplate"
    BarChartTemplate = "BarChartTemplate"
    HorizontalBarChartTemplate = "HorizontalBarChartTemplate"
    PieChartTemplate = "PieChartTemplate"
    DonutChartTemplate = "DonutChartTemplate"
    StackedGroupBarChartTemplate = "StackedGroupBarChartTemplate"
    PyramidBarChartTemplate = "PyramidBarChartTemplate"
    LineColumnChartTemplate = "LineColumnChartTemplate"
    RadarChartTemplate = "RadarChartTemplate"
    RadarChartMultipleTemplate = "RadarChartMultipleTemplate"
    RadarChartPolarTemplate = "RadarChartPolarTemplate"
    ScatterChartTemplate = "ScatterChartTemplate"
    CandlestickTemplate = "CandlestickTemplate"
    BoxPlotTemplate = "BoxPlotTemplate"


viz_props = {
    ChartType.AreaChartTemplate: {
        "charSeries": [
            {"name": "", "data": []}
        ],
        "labels": []
    },
    ChartType.LineChartTemplate: {
        "series": [],
        "categories": [],
    },
    ChartType.BarChartTemplate: {
        "charSeries": [
            {"name": "", "data": []}
        ],
        "categories": [],
    },
    ChartType.HorizontalBarChartTemplate: {
        "charSeries": [
            {"name": "", "data": []}
        ],
        "categories": [],
    },
    ChartType.PieChartTemplate: {
        "series": [],
        "labels": []
    }
}


class DataFormatter:
    def __init__(self, state: State):
        self.llm_manager = LLMManager()
        self.state = state

    def choose_visualization(self) -> dict:
        """Choose an appropriate visualization for the data."""
        question = self.state.question
        results = self.state.results
        sql_query = self.state.sql_query

        if results == "NOT_RELEVANT":
            return {"visualization": "none", "visualization_reasoning": "No visualization needed for irrelevant questions."}

        prompt = ChatPromptTemplate.from_messages([
            ("system", '''
            You are an expert AI assistant that recommends appropriate data visualizations. Based on the user's question, SQL query, and query results, suggest the most suitable type of graph or chart to visualize the data. If no visualization is appropriate, indicate that.

            Available chart types and their use cases:
                - BarChartTemplate: Best for comparing categorical data or showing changes over time when categories are discrete and the number of categories is more than 2.
                - HorizontalBarChartTemplate: Best for comparing categorical data or showing changes over time when the number of categories is small or the disparity between categories is large.
                - PieChartTemplate: Ideal for showing proportions or percentages within a whole.
                - LineChartTemplate: Best for showing trends and distributions over time. Best used when both x axis and y axis are continuous.
                - AreaChartTemplate: Suitable for showing trends over time while emphasizing the magnitude of values.

            Make sure that the chart type you choose is one of the above. 'HorizontalBarChartTemplate' is allowed but not 'HorizontalBarChartTemplate .'.
            Consider these types of questions when recommending a visualization:
            1. Aggregations and Summarizations (e.g., "What is the average revenue by month?" - Line Chart)
            2. Comparisons (e.g., "Compare the sales figures of Product A and Product B over the last year." - Line or Column Chart)
            3. Trends Over Time (e.g., "What is the trend in the number of active users over the past year?" - Line Chart)
            4. Proportions (e.g., "What is the market share of the products?" - Pie Chart)
            5. Emphasizing Total Values Over Time (e.g., "What is the trend in monthly sales?" - Area Chart)
            
            As much as possible, try to provide a visualization and try not to recommend none.

            Provide your response in the following format:
            Recommended Visualization: [Chart type or "None"]. ONLY use the above given names.
            Reason: [Brief explanation for your recommendation]
            '''),
            ("human", '''
            User question: {question}
            SQL query: {sql_query}
            Query results: {results}

            Recommend a visualization:'''),
        ])

        response = self.llm_manager.invoke(
            prompt, question=question, sql_query=sql_query, results=results)

        lines = response.split('\n')
        visualization = lines[0].split(': ')[1].strip()
        reason = lines[1].split(': ')[1].strip()

        return {"visualization": visualization, "visualization_reason": reason}

    def format_data_for_visualization(self) -> dict:
        """Format the data for the chosen visualization type."""
        visualization = self.state.visualization['visualization']
        results = self.state.results
        question = self.state.question
        sql_query = self.state.sql_query

        print("chosen visualization: ", visualization)

        if visualization == "none":
            return {"formatted_data_for_visualization": None}

        visualization_props = viz_props[ChartType(visualization)]

        print("visualization_props: ", visualization_props)
        prompt = ChatPromptTemplate.from_messages([
            ("system", '''
            You are an AI assistant that formats data for data visualizations.
            You are given the following data:
            - The SQL query that was used to get the data
            - The results of the SQL query
            - The type of visualization that was chosen and its props that we will use in the frontend
            - The user's question
            
            You need to format the data for the visualization.
            
            Available chart types (in Javascript) Make sure to use the exact names ONLY:
            LineChartTemplate, BarChartTemplate, HorizontalBarChartTemplate, PieChartTemplate, AreaChartTemplate
            '''),
            ("human", '''
            SQL query: {sql_query}
            Query results: {results}
            Type of visualization: {visualization}
            User's question: {question}
            Visualization props format: {visualization_props}

            Format the data for the visualization:
            '''),
        ])

        print("invoking llm_manager")
        try:
            response = self.llm_manager.invoke(prompt, sql_query=sql_query, results=results,
                                               visualization=visualization, question=question, visualization_props=visualization_props)
        except Exception as e:
            print("Error invoking llm_manager: ", e)
            raise e

        print("response: ", response)

        self.state.formatted_data = JsonOutputParser().parse(response)

        return {"formatted_data_for_visualization": self.state.formatted_data}
