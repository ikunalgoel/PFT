import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample data generators
const categories = [
  'groceries', 'dining', 'transportation', 'entertainment', 
  'utilities', 'healthcare', 'shopping', 'travel', 'education', 'other'
];

const merchants = {
  groceries: ['Whole Foods', 'Trader Joes', 'Safeway', 'Costco', 'Target'],
  dining: ['Chipotle', 'Starbucks', 'Olive Garden', 'McDonalds', 'Subway'],
  transportation: ['Uber', 'Lyft', 'Shell Gas', 'Chevron', 'Metro Transit'],
  entertainment: ['Netflix', 'Spotify', 'AMC Theaters', 'Steam', 'PlayStation Store'],
  utilities: ['PG&E', 'Comcast', 'AT&T', 'Water District', 'Waste Management'],
  healthcare: ['CVS Pharmacy', 'Walgreens', 'Kaiser', 'LabCorp', 'Dental Care'],
  shopping: ['Amazon', 'Best Buy', 'Nike', 'IKEA', 'Home Depot'],
  travel: ['United Airlines', 'Hilton Hotels', 'Airbnb', 'Expedia', 'Hertz'],
  education: ['Coursera', 'Udemy', 'Amazon Books', 'Scribd', 'LinkedIn Learning'],
  other: ['Misc Store', 'Online Service', 'Local Shop', 'Donation', 'Gift']
};

const descriptions = {
  groceries: ['Weekly groceries', 'Fresh produce', 'Household items', 'Snacks and drinks'],
  dining: ['Lunch', 'Dinner', 'Coffee', 'Breakfast', 'Quick bite'],
  transportation: ['Ride to work', 'Gas fill-up', 'Monthly pass', 'Airport ride'],
  entertainment: ['Monthly subscription', 'Movie tickets', 'Game purchase', 'Concert tickets'],
  utilities: ['Monthly bill', 'Internet service', 'Phone bill', 'Water bill'],
  healthcare: ['Prescription refill', 'Doctor visit copay', 'Medical supplies', 'Vitamins'],
  shopping: ['Online order', 'Electronics', 'Clothing', 'Home improvement'],
  travel: ['Flight booking', 'Hotel stay', 'Vacation rental', 'Car rental'],
  education: ['Online course', 'Book purchase', 'Learning subscription', 'Training material'],
  other: ['Miscellaneous', 'One-time purchase', 'Service fee', 'Charitable donation']
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(category: string): number {
  const ranges: Record<string, [number, number]> = {
    groceries: [30, 150],
    dining: [10, 80],
    transportation: [5, 100],
    entertainment: [10, 60],
    utilities: [50, 200],
    healthcare: [20, 150],
    shopping: [25, 300],
    travel: [100, 1000],
    education: [15, 200],
    other: [10, 100]
  };
  
  const [min, max] = ranges[category] || [10, 100];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
}

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');
    
    // Get the test user
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    const testUser = users.find(u => u.email === 'test@example.com');
    
    if (!testUser) {
      console.error('Test user not found. Please create a user with email test@example.com first.');
      return;
    }
    
    const userId = testUser.id;
    console.log(`✓ Found user: ${testUser.email} (${userId})`);
    
    // Generate transactions for the last 90 days
    const transactions = [];
    const numTransactions = 150; // Generate 150 transactions
    
    console.log(`📝 Generating ${numTransactions} transactions...`);
    
    for (let i = 0; i < numTransactions; i++) {
      const category = getRandomElement(categories);
      const merchant = getRandomElement(merchants[category as keyof typeof merchants]);
      const description = getRandomElement(descriptions[category as keyof typeof descriptions]);
      const amount = getRandomAmount(category);
      const date = getRandomDate(90);
      
      transactions.push({
        user_id: userId,
        amount,
        category,
        merchant,
        notes: description,
        date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Insert transactions in batches
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const { error } = await supabase
        .from('transactions')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} transactions)`);
      }
    }
    
    console.log(`✓ Successfully created ${transactions.length} transactions`);
    
    // Create budgets for each category
    console.log('💰 Creating budgets...');
    
    const budgetAmounts: Record<string, number> = {
      groceries: 600,
      dining: 400,
      transportation: 300,
      entertainment: 200,
      utilities: 350,
      healthcare: 250,
      shopping: 500,
      travel: 1000,
      education: 150,
      other: 200
    };
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const budgets = categories.map(category => ({
      user_id: userId,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget`,
      category,
      amount: budgetAmounts[category],
      period_type: 'monthly',
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error: budgetError } = await supabase
      .from('budgets')
      .insert(budgets);
    
    if (budgetError) {
      console.error('Error creating budgets:', budgetError);
    } else {
      console.log(`✓ Successfully created ${budgets.length} budgets`);
    }
    
    console.log('✅ Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Transactions: ${transactions.length}`);
    console.log(`   - Budgets: ${budgets.length}`);
    console.log(`   - Date range: Last 90 days`);
    console.log(`   - User: ${testUser.email}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeding
seedData().then(() => {
  console.log('\n✓ Seeding script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
