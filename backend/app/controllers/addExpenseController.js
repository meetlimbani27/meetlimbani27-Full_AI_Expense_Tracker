// app/controllers/addExpenseController.js
const { ChatOpenAI } = require('@langchain/openai');
// const { SystemMessage, HumanMessage } = require('@langchain/core/messages');

const addExpenseController = {};

/**
 * Handles adding an expense by categorizing it as 'add' or 'retrieve'.
 */
addExpenseController.addExpense = async (req, res, next) => {
    const { IncomingExpense } = req.body;

    if (!IncomingExpense) {
        return res.status(400).json({ error: 'Expense field is required.' });
    }

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,  // Lower temperature for more consistent outputs
        modelName: "gpt-3.5-turbo"
    });

    // let message = [
    //     new SystemMessage("Categorize the expense as 'add' or 'retrieve' or 'not an expense': "),
    //     new HumanMessage(expense)
    // ]        // this approach requires more token but the latency is slightly low here
    const systemMessage = `Categorize the expense as 'add' or 'retrieve' or 'not an expense': "${IncomingExpense}"`;

    try {
        const resFromModel = await model.invoke(systemMessage);
        const category = resFromModel.content.trim().toLowerCase();

        if (category === 'add') {
            message = 'Expense added successfully!';

        } else if (category === 'retrieve') {
            message = 'Expense retrieved successfully!';

        } else if (category === 'not an expense') {
            message = 'This is not an expense.';

        } else {
            return res.status(400).json({ error: 'Invalid category received from model.' });
        }

        console.log('Action completed successfully.');
        res.status(200).json({ message: message, category });
    } catch (error) {
        console.error('Error processing expense:', error);
        next(error); // Pass to error handling middleware
    }
};

module.exports = addExpenseController;
