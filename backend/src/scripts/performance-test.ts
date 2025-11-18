/**
 * Performance testing script for large datasets
 * Tests the application with 1000+ transactions
 */

import { supabase } from '../config/supabase.js';

interface TestTransaction {
  user_id: string;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  notes: string;
}

const CATEGORIES = [
  'Groceries',
  'Dining',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Travel',
  'Education',
  'Other',
];

const MERCHANTS = [
  'Walmart',
  'Target',
  'Amazon',
  'Starbucks',
  'McDonalds',
  'Shell Gas',
  'Netflix',
  'Spotify',
  'Uber',
  'Lyft',
  'CVS Pharmacy',
  'Walgreens',
  'Best Buy',
  'Home Depot',
  'Costco',
];

/**
 * Generate random transaction data
 */
function generateTransaction(userId: string, daysAgo: number): TestTransaction {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    user_id: userId,
    date: date.toISOString().split('T')[0],
    amount: Math.round((Math.random() * 200 + 10) * 100) / 100,
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    notes: Math.random() > 0.7 ? 'Test transaction' : '',
  };
}

/**
 * Generate bulk transactions
 */
function generateBulkTransactions(
  userId: string,
  count: number
): TestTransaction[] {
  const transactions: TestTransaction[] = [];
  const daysRange = 365; // Spread over 1 year

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * daysRange);
    transactions.push(generateTransaction(userId, daysAgo));
  }

  return transactions;
}

/**
 * Insert transactions in batches
 */
async function insertTransactionsBatch(
  transactions: TestTransaction[],
  batchSize: number = 100
) {
  console.log(`📊 Inserting ${transactions.length} transactions...`);
  const startTime = Date.now();

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);

    try {
      const { error } = await supabase.from('transactions').insert(batch);

      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(
          `\r✓ Inserted ${inserted}/${transactions.length} transactions`
        );
      }
    } catch (err) {
      console.error(`❌ Batch ${i / batchSize + 1} error:`, err);
      errors += batch.length;
    }
  }

  const duration = Date.now() - startTime;
  console.log(`\n✅ Completed in ${duration}ms`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Rate: ${Math.round((inserted / duration) * 1000)} transactions/sec`);

  return { inserted, errors, duration };
}

/**
 * Test query performance
 */
async function testQueryPerformance(userId: string) {
  console.log('\n📈 Testing query performance...\n');

  // Test 1: Fetch all transactions
  const test1Start = Date.now();
  const { data: allTransactions, error: error1 } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  const test1Duration = Date.now() - test1Start;

  console.log(`Test 1 - Fetch all transactions:`);
  console.log(`  Duration: ${test1Duration}ms`);
  console.log(`  Count: ${allTransactions?.length || 0}`);
  console.log(`  Status: ${error1 ? '❌ Failed' : '✅ Passed'}`);

  // Test 2: Fetch with date range filter
  const test2Start = Date.now();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: recentTransactions, error: error2 } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false });
  const test2Duration = Date.now() - test2Start;

  console.log(`\nTest 2 - Fetch last 30 days (with index):`);
  console.log(`  Duration: ${test2Duration}ms`);
  console.log(`  Count: ${recentTransactions?.length || 0}`);
  console.log(`  Status: ${error2 ? '❌ Failed' : '✅ Passed'}`);

  // Test 3: Category aggregation
  const test3Start = Date.now();
  const { data: categoryData, error: error3 } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', userId);
  const test3Duration = Date.now() - test3Start;

  console.log(`\nTest 3 - Category aggregation:`);
  console.log(`  Duration: ${test3Duration}ms`);
  console.log(`  Count: ${categoryData?.length || 0}`);
  console.log(`  Status: ${error3 ? '❌ Failed' : '✅ Passed'}`);

  // Test 4: Complex query with multiple filters
  const test4Start = Date.now();
  const { data: complexQuery, error: error4 } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .in('category', ['Groceries', 'Dining', 'Shopping'])
    .gte('amount', 50)
    .order('date', { ascending: false })
    .limit(100);
  const test4Duration = Date.now() - test4Start;

  console.log(`\nTest 4 - Complex filtered query:`);
  console.log(`  Duration: ${test4Duration}ms`);
  console.log(`  Count: ${complexQuery?.length || 0}`);
  console.log(`  Status: ${error4 ? '❌ Failed' : '✅ Passed'}`);

  return {
    test1: { duration: test1Duration, count: allTransactions?.length || 0 },
    test2: { duration: test2Duration, count: recentTransactions?.length || 0 },
    test3: { duration: test3Duration, count: categoryData?.length || 0 },
    test4: { duration: test4Duration, count: complexQuery?.length || 0 },
  };
}

/**
 * Clean up test data
 */
async function cleanupTestData(userId: string) {
  console.log('\n🧹 Cleaning up test data...');
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('❌ Cleanup failed:', error.message);
    return false;
  }

  console.log('✅ Test data cleaned up');
  return true;
}

/**
 * Main performance test
 */
async function runPerformanceTest() {
  console.log('🚀 Starting Performance Test\n');
  console.log('=' .repeat(50));

  // Use a test user ID (you should replace this with an actual test user)
  const testUserId = process.env.TEST_USER_ID || 'test-user-performance';

  if (!testUserId || testUserId === 'test-user-performance') {
    console.error('❌ Please set TEST_USER_ID environment variable');
    console.error('   Example: TEST_USER_ID=your-user-id npm run test:performance');
    process.exit(1);
  }

  try {
    // Generate test data
    console.log(`\n📝 Generating 1000 test transactions...`);
    const transactions = generateBulkTransactions(testUserId, 1000);
    console.log(`✅ Generated ${transactions.length} transactions\n`);

    // Insert transactions
    const insertResults = await insertTransactionsBatch(transactions);

    if (insertResults.inserted === 0) {
      console.error('❌ No transactions were inserted. Aborting test.');
      process.exit(1);
    }

    // Wait a moment for database to settle
    console.log('\n⏳ Waiting for database to settle...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test query performance
    const queryResults = await testQueryPerformance(testUserId);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Performance Test Summary\n');
    console.log(`Total Transactions: ${insertResults.inserted}`);
    console.log(`Insert Duration: ${insertResults.duration}ms`);
    console.log(`Insert Rate: ${Math.round((insertResults.inserted / insertResults.duration) * 1000)} tx/sec\n`);
    console.log('Query Performance:');
    console.log(`  All transactions: ${queryResults.test1.duration}ms (${queryResults.test1.count} rows)`);
    console.log(`  Date range filter: ${queryResults.test2.duration}ms (${queryResults.test2.count} rows)`);
    console.log(`  Category aggregation: ${queryResults.test3.duration}ms (${queryResults.test3.count} rows)`);
    console.log(`  Complex query: ${queryResults.test4.duration}ms (${queryResults.test4.count} rows)`);

    // Performance thresholds
    console.log('\n🎯 Performance Thresholds:');
    const allTxPass = queryResults.test1.duration < 2000;
    const dateRangePass = queryResults.test2.duration < 500;
    const categoryPass = queryResults.test3.duration < 1000;
    const complexPass = queryResults.test4.duration < 500;

    console.log(`  All transactions < 2000ms: ${allTxPass ? '✅' : '❌'} (${queryResults.test1.duration}ms)`);
    console.log(`  Date range < 500ms: ${dateRangePass ? '✅' : '❌'} (${queryResults.test2.duration}ms)`);
    console.log(`  Category agg < 1000ms: ${categoryPass ? '✅' : '❌'} (${queryResults.test3.duration}ms)`);
    console.log(`  Complex query < 500ms: ${complexPass ? '✅' : '❌'} (${queryResults.test4.duration}ms)`);

    // Cleanup
    const shouldCleanup = process.env.CLEANUP !== 'false';
    if (shouldCleanup) {
      await cleanupTestData(testUserId);
    } else {
      console.log('\n⚠️  Skipping cleanup (CLEANUP=false)');
    }

    console.log('\n✅ Performance test completed!');
    console.log('=' .repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Performance test failed:', error);
    process.exit(1);
  }
}

// Run the test
runPerformanceTest();
