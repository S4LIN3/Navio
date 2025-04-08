import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useToast } from "@/hooks/use-toast";

export function FinancialPlanningPage() {
  const { toast } = useToast();
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [showEditGoalDialog, setShowEditGoalDialog] = useState(false);
  const [showDeleteGoalDialog, setShowDeleteGoalDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof financialGoals[0] | null>(null);
  
  const [editGoalForm, setEditGoalForm] = useState({
    title: "",
    currentAmount: "",
    targetAmount: "",
    targetDate: "",
    category: ""
  });
  
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: ""
  });
  
  // Sample data for demonstration
  const [expenseData, setExpenseData] = useState([
    { name: "Housing", value: 1200, color: "#4F86F7" },
    { name: "Food", value: 400, color: "#8B5CF6" },
    { name: "Transportation", value: 300, color: "#3BC9A4" },
    { name: "Utilities", value: 200, color: "#F59E0B" },
    { name: "Entertainment", value: 150, color: "#EF4444" },
    { name: "Other", value: 250, color: "#6B7280" }
  ]);
  
  const [savingsData, setSavingsData] = useState([
    { month: "Jan", amount: 600 },
    { month: "Feb", amount: 750 },
    { month: "Mar", amount: 500 },
    { month: "Apr", amount: 800 },
    { month: "May", amount: 650 },
    { month: "Jun", amount: 900 }
  ]);
  
  const [financialGoals, setFinancialGoals] = useState([
    { id: 1, title: "Emergency Fund", currentAmount: 3000, targetAmount: 10000, targetDate: "2023-12-31", category: "Savings", status: "In Progress" },
    { id: 2, title: "Vacation Fund", currentAmount: 1500, targetAmount: 3000, targetDate: "2023-12-31", category: "Travel", status: "In Progress" },
    { id: 3, title: "New Laptop", currentAmount: 800, targetAmount: 1600, targetDate: "2024-03-31", category: "Electronics", status: "In Progress" }
  ]);
  
  const [transactions, setTransactions] = useState([
    { id: 1, type: "expense", category: "Food", amount: 45.50, date: "2023-11-01", description: "Grocery shopping" },
    { id: 2, type: "expense", category: "Entertainment", amount: 15.99, date: "2023-11-02", description: "Movie tickets" },
    { id: 3, type: "income", category: "Salary", amount: 3000, date: "2023-11-03", description: "Monthly salary" },
    { id: 4, type: "expense", category: "Utilities", amount: 75.20, date: "2023-11-04", description: "Electricity bill" },
    { id: 5, type: "expense", category: "Transportation", amount: 30, date: "2023-11-05", description: "Fuel" }
  ]);
  
  const [transactionForm, setTransactionForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  
  const [goalForm, setGoalForm] = useState({
    title: "",
    currentAmount: "",
    targetAmount: "",
    targetDate: "",
    category: ""
  });
  
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    amount: ""
  });
  
  // Calculate total income from income transactions
  const calculateTotalIncome = () => {
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  };
  
  const totalIncome = Math.max(calculateTotalIncome(), 3000); // Ensure we have at least a baseline income
  const totalExpenses = expenseData.reduce((acc, item) => acc + item.value, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransactionForm({
      ...transactionForm,
      [name]: value
    });
  };
  
  const handleTransactionTypeChange = (type: string) => {
    setTransactionForm({
      ...transactionForm,
      type
    });
  };
  
  const handleTransactionCategoryChange = (category: string) => {
    setTransactionForm({
      ...transactionForm,
      category
    });
  };
  
  const handleGoalFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoalForm({
      ...goalForm,
      [name]: value
    });
  };
  
  const handleGoalCategoryChange = (category: string) => {
    setGoalForm({
      ...goalForm,
      category
    });
  };
  
  const handleBudgetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBudgetForm({
      ...budgetForm,
      [name]: value
    });
  };
  
  const handleBudgetCategoryChange = (category: string) => {
    setBudgetForm({
      ...budgetForm,
      category
    });
  };
  
  const addTransaction = () => {
    if (!transactionForm.category || !transactionForm.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const amountValue = parseFloat(transactionForm.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }
    
    const newTransaction = {
      id: transactions.length + 1,
      type: transactionForm.type,
      category: transactionForm.category,
      amount: amountValue,
      date: transactionForm.date,
      description: transactionForm.description
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Update income/expense data based on the transaction type
    if (transactionForm.type === 'income') {
      // For simplicity, we're not updating the charts directly
      // In a real app, you would update the income data and recalculate savings
      toast({
        title: "Income added",
        description: `$${amountValue.toLocaleString()} has been added to your income.`,
      });
    } else {
      // Update expense data for the pie chart
      const updatedExpenseData = [...expenseData];
      const categoryIndex = updatedExpenseData.findIndex(item => item.name === transactionForm.category);
      
      if (categoryIndex >= 0) {
        // Update existing category
        updatedExpenseData[categoryIndex] = {
          ...updatedExpenseData[categoryIndex],
          value: updatedExpenseData[categoryIndex].value + amountValue
        };
      } else {
        // Add new category
        const colors = ["#4F86F7", "#8B5CF6", "#3BC9A4", "#F59E0B", "#EF4444", "#6B7280"];
        updatedExpenseData.push({
          name: transactionForm.category,
          value: amountValue,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      setExpenseData(updatedExpenseData);
      
      toast({
        title: "Expense added",
        description: `$${amountValue.toLocaleString()} has been added to your expenses.`,
      });
    }
    
    setShowAddTransactionDialog(false);
    setTransactionForm({
      type: "expense",
      category: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      description: ""
    });
  };
  
  const addFinancialGoal = () => {
    if (!goalForm.title || !goalForm.targetAmount || !goalForm.targetDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const newGoal = {
      id: financialGoals.length + 1,
      title: goalForm.title,
      currentAmount: parseFloat(goalForm.currentAmount) || 0,
      targetAmount: parseFloat(goalForm.targetAmount),
      targetDate: goalForm.targetDate,
      category: goalForm.category,
      status: "In Progress"
    };
    
    setFinancialGoals([...financialGoals, newGoal]);
    
    toast({
      title: "Goal added",
      description: "Your financial goal has been successfully created."
    });
    
    setShowAddGoalDialog(false);
    setGoalForm({
      title: "",
      currentAmount: "",
      targetAmount: "",
      targetDate: "",
      category: ""
    });
  };
  
  const updateBudget = () => {
    if (!budgetForm.category || !budgetForm.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedExpenseData = expenseData.map(item => {
      if (item.name === budgetForm.category) {
        return { ...item, value: parseFloat(budgetForm.amount) };
      }
      return item;
    });
    
    setExpenseData(updatedExpenseData);
    
    toast({
      title: "Budget updated",
      description: `Budget for ${budgetForm.category} has been updated.`
    });
    
    setShowBudgetDialog(false);
    setBudgetForm({
      category: "",
      amount: ""
    });
  };
  
  const handleEditGoalClick = (goal: typeof financialGoals[0]) => {
    setSelectedGoal(goal);
    setEditGoalForm({
      title: goal.title,
      currentAmount: goal.currentAmount.toString(),
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category
    });
    setShowEditGoalDialog(true);
  };
  
  const handleDeleteGoalClick = (goal: typeof financialGoals[0]) => {
    setSelectedGoal(goal);
    setShowDeleteGoalDialog(true);
  };
  
  const editFinancialGoal = () => {
    if (!editGoalForm.title || !editGoalForm.targetAmount || !editGoalForm.targetDate || !selectedGoal) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedGoals = financialGoals.map(goal => {
      if (selectedGoal && goal.id === selectedGoal.id) {
        return {
          ...goal,
          title: editGoalForm.title,
          currentAmount: parseFloat(editGoalForm.currentAmount) || 0,
          targetAmount: parseFloat(editGoalForm.targetAmount),
          targetDate: editGoalForm.targetDate,
          category: editGoalForm.category
        };
      }
      return goal;
    });
    
    setFinancialGoals(updatedGoals);
    
    toast({
      title: "Goal updated",
      description: "Your financial goal has been successfully updated."
    });
    
    setShowEditGoalDialog(false);
    setSelectedGoal(null);
  };
  
  const deleteFinancialGoal = () => {
    if (!selectedGoal) return;
    
    const updatedGoals = financialGoals.filter(goal => goal.id !== selectedGoal.id);
    setFinancialGoals(updatedGoals);
    
    toast({
      title: "Goal deleted",
      description: "Your financial goal has been successfully deleted."
    });
    
    setShowDeleteGoalDialog(false);
    setSelectedGoal(null);
  };
  
  const handleAddMoneyClick = (goal: typeof financialGoals[0]) => {
    setSelectedGoal(goal);
    setAddMoneyForm({
      amount: ""
    });
    setShowAddMoneyDialog(true);
  };
  
  const handleAddMoneyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddMoneyForm({
      ...addMoneyForm,
      [name]: value
    });
  };
  
  const addMoneyToGoal = () => {
    if (!addMoneyForm.amount || !selectedGoal) {
      toast({
        title: "Missing information",
        description: "Please enter the amount you want to add.",
        variant: "destructive"
      });
      return;
    }
    
    const amountToAdd = parseFloat(addMoneyForm.amount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the goal with the new amount
    const updatedGoals = financialGoals.map(goal => {
      if (goal.id === selectedGoal.id) {
        const newAmount = goal.currentAmount + amountToAdd;
        const newStatus = newAmount >= goal.targetAmount ? "Completed" : "In Progress";
        
        return {
          ...goal,
          currentAmount: newAmount,
          status: newStatus
        };
      }
      return goal;
    });
    
    setFinancialGoals(updatedGoals);
    
    // Add a transaction for this contribution
    const newTransaction = {
      id: transactions.length + 1,
      type: "expense",
      category: "Savings",
      amount: amountToAdd,
      date: new Date().toISOString().split('T')[0],
      description: `Contribution to ${selectedGoal.title}`
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    toast({
      title: "Money added",
      description: `Successfully added $${amountToAdd.toLocaleString()} to ${selectedGoal.title}.`
    });
    
    setShowAddMoneyDialog(false);
    setSelectedGoal(null);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Financial Planning</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBudgetDialog(true)}>
            <span className="material-icons mr-2 text-sm">pie_chart</span>
            Set Budget
          </Button>
          <Button variant="outline" onClick={() => setShowAddGoalDialog(true)}>
            <span className="material-icons mr-2 text-sm">flag</span>
            New Goal
          </Button>
          <Button onClick={() => setShowAddTransactionDialog(true)}>
            <span className="material-icons mr-2 text-sm">add</span>
            Add Transaction
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-neutral-800">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="material-icons text-green-500 text-3xl mr-3">trending_up</span>
              <div>
                <p className="text-2xl font-bold">${totalIncome.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">Monthly</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-neutral-800">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="material-icons text-red-500 text-3xl mr-3">trending_down</span>
              <div>
                <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">Monthly</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-neutral-800">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-2xl font-bold">{savingsRate.toFixed(1)}%</p>
                <p className="text-sm text-neutral-500">Goal: 20%</p>
              </div>
              <Progress value={savingsRate} className="h-2" />
            </div>
            <p className="text-sm text-neutral-500">
              {savingsRate >= 20 
                ? "Great job! You're meeting your savings goal." 
                : "You're below your target savings rate."}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-800">Monthly Expenses</CardTitle>
            <CardDescription>Breakdown of your spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-neutral-800">Savings History</CardTitle>
            <CardDescription>Your savings over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={savingsData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#4F86F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Financial Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {financialGoals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium text-neutral-800">{goal.title}</CardTitle>
                <Badge className="bg-primary-100 text-primary-800">{goal.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-neutral-700">
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-600">
                    {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                  </span>
                </div>
                <Progress value={Math.round((goal.currentAmount / goal.targetAmount) * 100)} className="h-2" />
              </div>
              <p className="text-sm text-neutral-500 mb-4">Target date: {new Date(goal.targetDate).toLocaleDateString()}</p>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddMoneyClick(goal)}
                >
                  <span className="material-icons text-sm mr-1">add</span>
                  Add Money
                </Button>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditGoalClick(goal)}
                  >
                    <span className="material-icons text-sm mr-1">edit</span>
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteGoalClick(goal)}
                  >
                    <span className="material-icons text-sm mr-1">delete</span>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Transactions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm">{transaction.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={transaction.type === 'income' ? 'outline' : 'secondary'} className={transaction.type === 'income' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{transaction.category}</td>
                      <td className="px-4 py-3 text-sm">{transaction.description}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <Button variant="link">View All Transactions</Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Record your income or expenses to track your financial activity.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <div className="flex">
                  <Button
                    type="button"
                    variant={transactionForm.type === 'income' ? 'default' : 'outline'}
                    className={`rounded-r-none flex-1 ${transactionForm.type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => handleTransactionTypeChange('income')}
                  >
                    Income
                  </Button>
                  <Button
                    type="button"
                    variant={transactionForm.type === 'expense' ? 'default' : 'outline'}
                    className={`rounded-l-none flex-1 ${transactionForm.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    onClick={() => handleTransactionTypeChange('expense')}
                  >
                    Expense
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={transactionForm.date}
                  onChange={handleTransactionFormChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={transactionForm.category} onValueChange={handleTransactionCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionForm.type === 'income' ? (
                    <>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Investments">Investments</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Gifts">Gifts</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transactionForm.amount}
                onChange={handleTransactionFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="What was this transaction for?"
                value={transactionForm.description}
                onChange={handleTransactionFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransactionDialog(false)}>Cancel</Button>
            <Button onClick={addTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Financial Goal Dialog */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Financial Goal</DialogTitle>
            <DialogDescription>Set a financial goal to help you save for important milestones.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Vacation Fund, Emergency Fund"
                value={goalForm.title}
                onChange={handleGoalFormChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input
                  id="currentAmount"
                  name="currentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={goalForm.currentAmount}
                  onChange={handleGoalFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={goalForm.targetAmount}
                  onChange={handleGoalFormChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={goalForm.targetDate}
                  onChange={handleGoalFormChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={goalForm.category} onValueChange={handleGoalCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>Cancel</Button>
            <Button onClick={addFinancialGoal}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Financial Goal Dialog */}
      <Dialog open={showEditGoalDialog} onOpenChange={setShowEditGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Financial Goal</DialogTitle>
            <DialogDescription>Update your financial goal details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Goal Title</Label>
              <Input 
                id="edit-title"
                name="title"
                value={editGoalForm.title}
                onChange={(e) => setEditGoalForm({...editGoalForm, title: e.target.value})}
                placeholder="e.g., New Car, Dream Vacation"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currentAmount">Current Amount ($)</Label>
                <Input 
                  id="edit-currentAmount"
                  name="currentAmount"
                  value={editGoalForm.currentAmount}
                  onChange={(e) => setEditGoalForm({...editGoalForm, currentAmount: e.target.value})}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">Target Amount ($)</Label>
                <Input 
                  id="edit-targetAmount"
                  name="targetAmount"
                  value={editGoalForm.targetAmount}
                  onChange={(e) => setEditGoalForm({...editGoalForm, targetAmount: e.target.value})}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetDate">Target Date</Label>
                <Input 
                  id="edit-targetDate"
                  name="targetDate"
                  type="date"
                  value={editGoalForm.targetDate}
                  onChange={(e) => setEditGoalForm({...editGoalForm, targetDate: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editGoalForm.category} 
                  onValueChange={(val) => setEditGoalForm({...editGoalForm, category: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Vehicle">Vehicle</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditGoalDialog(false)}>Cancel</Button>
            <Button onClick={editFinancialGoal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Financial Goal Dialog */}
      <Dialog open={showDeleteGoalDialog} onOpenChange={setShowDeleteGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Financial Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this financial goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="py-4">
              <h3 className="font-semibold text-lg mb-2">{selectedGoal.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary-100 text-primary-800">
                  {selectedGoal.category}
                </Badge>
                <span className="text-sm text-neutral-500">
                  Target: ${selectedGoal.targetAmount.toLocaleString()}
                </span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-neutral-700">
                    ${selectedGoal.currentAmount.toLocaleString()} / ${selectedGoal.targetAmount.toLocaleString()}
                  </span>
                  <span className="text-sm text-neutral-600">
                    {Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%
                  </span>
                </div>
                <Progress value={Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)} className="h-2" />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteGoalDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteFinancialGoal}>Delete Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Set Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>Adjust your monthly budget for different spending categories.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={budgetForm.category} onValueChange={handleBudgetCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseData.map((expense) => (
                    <SelectItem key={expense.name} value={expense.name}>
                      {expense.name} (Current: ${expense.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">New Budget Amount ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={budgetForm.amount}
                onChange={handleBudgetFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
            <Button onClick={updateBudget}>Update Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Financial Goal Dialog */}
      <AlertDialog open={showDeleteGoalDialog} onOpenChange={setShowDeleteGoalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Financial Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this financial goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteFinancialGoal} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Goal</DialogTitle>
            <DialogDescription>
              {selectedGoal ? `Current balance: $${selectedGoal.currentAmount.toLocaleString()} / $${selectedGoal.targetAmount.toLocaleString()}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={addMoneyForm.amount}
                onChange={handleAddMoneyFormChange}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAddMoneyDialog(false)}>Cancel</Button>
            <Button onClick={addMoneyToGoal}>Add Money</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FinancialPlanningPage;
