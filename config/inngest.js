import connectDB from "./db.js";
import User from "../models/User.js"; 
import Order from "@/models/Order.js";
import Product from "@/models/Product.js";
import Donation from "@/models/Donation.js";
import Organization from "@/models/Organization.js";
import { Inngest } from "inngest"; 

// Create a client to send and receive events
export const inngest = new Inngest({ id: "go-with-the-flow" });

// Inngest function to save user data to database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" }, 
  async ({ event }) => {
    try {
      await connectDB();

      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        role: 'donor',
        cartItems: {},
        date: Date.now()
      };

      await User.create(userData);
      console.log("User created:", id);
      return { success: true, message: "User created successfully" };
    } catch (error) {
      console.error("Error in syncUserCreation:", error);
      throw error;
    }
  }
);

// Inngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        email: email_addresses[0].email_address,
        name: `${first_name} ${last_name}`,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      };

      await User.findByIdAndUpdate(id, userData);
      return { success: true, message: "User updated successfully" };
    } catch (error) {
      console.error("Error in syncUserUpdation:", error);
      throw error;
    }
  }
);

// Inngest function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();

      const { id } = event.data;
      await User.findByIdAndDelete(id);

      return { success: true, message: `User ${id} deleted` };
    } catch (error) {
      console.error("Error in syncUserDeletion:", error);
      throw error;
    }
  }
);

//Inngest Function to Create a User's Order in Database (Legacy)
export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    },
  },
  {event: 'order/created'},
  async ({events}) => {
    
    const orders = events.map((event)=>{
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date:event.data.date
      }
    })

    await connectDB()
    await Order.insertMany(orders)
    return {success:true, processed:orders.length};

  }
)

//Inngest Function to Process Donation Creation
export const processDonation = inngest.createFunction(
  {
    id: 'process-donation-creation',
    batchEvents: {
      maxSize: 5,
      timeout: '5s'
    },
  },
  {event: 'donation/created'},
  async ({events}) => {
    
    const donations = events.map((event)=>{
      return {
        donorId: event.data.donorId,
        organizationId: event.data.organizationId,
        totalItems: event.data.totalItems,
        status: event.data.status,
        date: event.data.date
      }
    })

    await connectDB()
    console.log("Processing donations:", donations.length);
    
    return {success: true, processed: donations.length};
  }
)
