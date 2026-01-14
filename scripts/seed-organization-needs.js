import mongoose from 'mongoose';
import OrganizationNeed from '../models/OrganizationNeed.js';
import connectDB from '../config/db.js';

const seedOrganizationNeeds = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if test organizations already exist
    const existingTestOrg1 = await OrganizationNeed.findOne({ 
      organizationName: 'Test Organization 1' 
    });
    const existingTestOrg2 = await OrganizationNeed.findOne({ 
      organizationName: 'Test Organization 2' 
    });

    // Create Test Organization 1 if it doesn't exist
    if (!existingTestOrg1) {
      const testOrg1 = new OrganizationNeed({
        organizationName: 'Test Organization 1',
        description: 'A test organization that helps provide essential items to those in need in our community.',
        requiredItems: [
          { name: 'Menstrual Products', notes: 'Pads and tampons of all sizes needed' },
          { name: 'Food / Canned Goods', notes: 'Non-perishable food items preferred' },
          { name: 'Clothing', notes: 'All sizes, especially winter clothing' }
        ],
        isActive: true
      });
      await testOrg1.save();
      console.log('Created Test Organization 1');
    } else {
      console.log('Test Organization 1 already exists');
    }

    // Create Test Organization 2 modeled after Test Organization 1
    if (!existingTestOrg2) {
      const testOrg2 = new OrganizationNeed({
        organizationName: 'Test Organization 2',
        description: 'A test organization that helps provide essential items to those in need in our community.',
        requiredItems: [
          { name: 'Menstrual Products', notes: 'Pads and tampons of all sizes needed' },
          { name: 'Food / Canned Goods', notes: 'Non-perishable food items preferred' },
          { name: 'Clothing', notes: 'All sizes, especially winter clothing' }
        ],
        isActive: true
      });
      await testOrg2.save();
      console.log('Created Test Organization 2');
    } else {
      console.log('Test Organization 2 already exists');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding organization needs:', error);
    process.exit(1);
  }
};

seedOrganizationNeeds();
