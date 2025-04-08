import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { mockSocialConnections } from "@/lib/mock-data";
import { SocialConnection } from "@/types";
import { formatRelativeDate } from "@/utils/date-utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const phoneRegex = /^\+?[0-9\s\(\)-]{10,20}$/;

const connectionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  relationship: z.string().min(1, { message: "Please select a relationship type" }),
  contactFrequency: z.string(),
  phoneNumber: z.string()
    .regex(phoneRegex, { message: "Please enter a valid phone number format" })
    .optional()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val),
});

export function SocialConnectionsPage() {
  const [connections, setConnections] = useState<SocialConnection[]>(mockSocialConnections);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<SocialConnection | null>(null);

  const form = useForm<z.infer<typeof connectionSchema>>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      relationship: "",
      contactFrequency: "14",
      phoneNumber: "",
    },
  });

  const onSubmit = (values: z.infer<typeof connectionSchema>) => {
    const newConnection: SocialConnection = {
      id: Math.max(...connections.map(c => c.id), 0) + 1,
      userId: 1,
      name: values.name,
      relationship: values.relationship,
      lastContactDate: new Date(),
      contactFrequency: parseInt(values.contactFrequency),
      phoneNumber: values.phoneNumber
    };

    setConnections([...connections, newConnection]);
    setOpenDialog(false);
    form.reset();
  };
  
  const handleDeleteClick = (connection: SocialConnection) => {
    setConnectionToDelete(connection);
    setDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (connectionToDelete) {
      setConnections(connections.filter(c => c.id !== connectionToDelete.id));
      setDeleteDialog(false);
      setConnectionToDelete(null);
    }
  };

  const getContactStatusColor = (lastContactDate?: Date, frequency?: number) => {
    if (!lastContactDate || !frequency) return "text-neutral-500";
    
    const daysSinceContact = Math.floor((Date.now() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceContact > frequency) {
      return "text-red-500";
    } else if (daysSinceContact > frequency * 0.7) {
      return "text-amber-500";
    } else {
      return "text-green-500";
    }
  };

  const getRelationshipColor = (relationship?: string) => {
    switch (relationship?.toLowerCase()) {
      case 'friend': return 'bg-primary-100 text-primary-800';
      case 'family': return 'bg-secondary-100 text-secondary-800';
      case 'colleague': return 'bg-accent-100 text-accent-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber.replace(/\s/g, '')}`);
    } else {
      alert("No phone number available for this contact");
    }
  };

  const handleMessage = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.open(`sms:${phoneNumber.replace(/\s/g, '')}`);
    } else {
      alert("No phone number available for this contact");
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Social Connections</h1>
        {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this connection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {connectionToDelete && (
            <div className="flex items-center space-x-3 py-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary-100 text-primary-800">
                  {connectionToDelete.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{connectionToDelete.name}</h3>
                <Badge variant="outline" className={`mt-1 ${getRelationshipColor(connectionToDelete.relationship)}`}>
                  {connectionToDelete.relationship}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Connection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2 text-sm">add</span>
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add a New Connection</DialogTitle>
              <DialogDescription>
                Keep track of your social connections and stay in touch regularly.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Friend">Friend</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                          <SelectItem value="Colleague">Colleague</SelectItem>
                          <SelectItem value="Acquaintance">Acquaintance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Frequency (days)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="7">Weekly (7 days)</SelectItem>
                          <SelectItem value="14">Bi-weekly (14 days)</SelectItem>
                          <SelectItem value="30">Monthly (30 days)</SelectItem>
                          <SelectItem value="90">Quarterly (90 days)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      {form.formState.errors.phoneNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.phoneNumber.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: +1 (555) 123-4567 or similar formats
                      </p>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Connection</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Connection Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center py-4">
              {connections.map((connection) => (
                <div 
                  key={connection.id} 
                  className="relative flex flex-col items-center space-y-2 p-3 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow group"
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteClick(connection)}
                  >
                    <span className="material-icons text-sm">close</span>
                  </Button>
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary-100 text-primary-800">
                      {connection.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-medium text-sm">{connection.name}</p>
                    <Badge variant="outline" className={`mt-1 ${getRelationshipColor(connection.relationship)}`}>
                      {connection.relationship}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Connections List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-800">
                    {connection.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-medium">{connection.name}</h3>
                  <Badge variant="outline" className={`mt-1 ${getRelationshipColor(connection.relationship)}`}>
                    {connection.relationship}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Last contact:</span>
                  <span className="text-sm font-medium">
                    {formatRelativeDate(connection.lastContactDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-neutral-600">Contact frequency:</span>
                  <span className="text-sm">Every {connection.contactFrequency} days</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-neutral-600">Status:</span>
                  <span className={`text-sm font-medium flex items-center ${getContactStatusColor(connection.lastContactDate, connection.contactFrequency)}`}>
                    <span className="material-icons text-sm mr-1">
                      {getContactStatusColor(connection.lastContactDate, connection.contactFrequency) === "text-green-500" 
                        ? "check_circle" 
                        : getContactStatusColor(connection.lastContactDate, connection.contactFrequency) === "text-amber-500"
                          ? "warning"
                          : "error"}
                    </span>
                    {getContactStatusColor(connection.lastContactDate, connection.contactFrequency) === "text-green-500" 
                      ? "Good" 
                      : getContactStatusColor(connection.lastContactDate, connection.contactFrequency) === "text-amber-500"
                        ? "Due soon"
                        : "Overdue"}
                  </span>
                </div>
                {connection.phoneNumber && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-neutral-600">Phone:</span>
                    <span className="text-sm">{connection.phoneNumber}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleCall(connection.phoneNumber)}
                >
                  <span className="material-icons text-sm mr-1">phone</span>
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleMessage(connection.phoneNumber)}
                >
                  <span className="material-icons text-sm mr-1">message</span>
                  Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-none w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteClick(connection)}
                >
                  <span className="material-icons text-sm">delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default SocialConnectionsPage;
