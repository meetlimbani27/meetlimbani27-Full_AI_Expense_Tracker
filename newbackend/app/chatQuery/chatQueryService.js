// app/chatQuery/chatQueryService.js

const { ChatOpenAI } = require('@langchain/openai');
const makeAddJSONService = require('../makeJSON/makeAddJSONService');
const notJSONService = require('../makeJSON/notJSONService');
const queryExpenseService = require('../retrieveExpense/retrieveExpenseService');



const expenseService = {};

expenseService.categorizeQuery = async (incomingQuery, mode) => {
  console.log('categorizeQuery service hit')

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000, 
  });
  // function calling model : gpt-4-0613

  const systemPrompt = `Categorize the expense's intent as either 'adding'(for adding expense) or 'querying'(for querying about expense) or 'not an expense'(for general questions) only. Here is the expense statement: "${incomingQuery}"`;

  try {
    const result = await model.invoke(systemPrompt);
    console.log("intent identified", result.content);
    intent = result.content.toLocaleLowerCase();

    switch (intent) {
      case 'adding':
        console.log('making JSON')
        const makeAddJSONResult = await makeAddJSONService.makeAddJSON(incomingQuery, mode);
        console.log('expense result', makeAddJSONResult)
        return {
                  response: makeAddJSONResult,
                  intent: intent,
                  content: "expense added"
                };

        case 'querying':
        console.log('querying expense')
        const queryExpenseResult = await queryExpenseService.queryExpense(incomingQuery);
        console.log('expense result', queryExpenseResult)
        return {
                  response: "query retrieved",
                  content : queryExpenseResult,
                  intent: intent
                };
      default:
        console.log('not an expense');
        const notJSONResult = await notJSONService.notJSON(incomingQuery);
        console.log('intent', intent)
        return {
          response: "general question",
          intent: intent,
          content: notJSONResult
        } 
    }


  } catch (error) {
    console.log('error in categorizing query',error)
  }
}
module.exports = expenseService;
