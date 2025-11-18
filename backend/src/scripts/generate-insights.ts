import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AIInsightsService } from '../services/ai-insights.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { SettingsService } from '../services/settings.service.js';
import { InsightsRepository } from '../repositories/insights.repository.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';
import { BudgetRepository } from '../repositories/budget.repository.js';
import { SettingsRepository } from '../repositories/settings.repository.js';
import { createLLMClient } from '../clients/llm.factory.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Command-line options
 */
interface ScriptOptions {
  userId?: string;
  email?: string;
  days?: number;
  verbose?: boolean;
}

/**
 * Parse command-line arguments
 */
function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  const options: ScriptOptions = {
    days: 30,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--user-id' && args[i + 1]) {
      options.userId = args[i + 1];
      i++;
    } else if (arg === '--email' && args[i + 1]) {
      options.email = args[i + 1];
      i++;
    } else if (arg === '--days' && args[i + 1]) {
      options.days = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
AI Insights Generator Script

Usage: npm run generate-insights [options]

Options:
  --user-id <id>     Generate insights for specific user ID
  --email <email>    Generate insights for user with this email
  --days <number>    Number of days to analyze (default: 30)
  --verbose, -v      Enable verbose logging
  --help, -h         Show this help message

Examples:
  npm run generate-insights
  npm run generate-insights --email test@example.com
  npm run generate-insights --user-id abc123 --days 60
  npm run generate-insights --verbose
  `);
}

/**
 * Get user by email or ID
 */
async function getUser(options: ScriptOptions): Promise<{ id: string; email: string } | null> {
  try {
    if (options.userId) {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(options.userId);
      if (error || !user) {
        console.error(`❌ User not found with ID: ${options.userId}`);
        return null;
      }
      return { id: user.id, email: user.email || 'unknown' };
    }

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return null;
    }

    const targetEmail = options.email || 'test@example.com';
    const user = users.find(u => u.email === targetEmail);
    
    if (!user) {
      console.error(`❌ User not found with email: ${targetEmail}`);
      return null;
    }

    return { id: user.id, email: user.email || 'unknown' };
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
}

/**
 * Generate insights for a user
 */
async function generateInsights(options: ScriptOptions): Promise<void> {
  try {
    console.log('🤖 AI Insights Generator');
    console.log('='.repeat(50));
    
    // Get user
    const user = await getUser(options);
    if (!user) {
      return;
    }

    console.log(`✓ User: ${user.email} (${user.id})`);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (options.days || 30));
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`✓ Period: ${startDateStr} to ${endDateStr} (${options.days} days)`);
    
    // Check for existing transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDateStr)
      .lte('date', endDateStr);
    
    if (txError) {
      console.error('❌ Error fetching transactions:', txError);
      return;
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('⚠️  No transactions found for this period. Cannot generate insights.');
      return;
    }
    
    console.log(`✓ Found ${transactions.length} transactions`);
    
    // Initialize services
    if (options.verbose) {
      console.log('\n📦 Initializing services...');
    }
    
    const transactionRepository = new TransactionRepository(supabase);
    const budgetRepository = new BudgetRepository(supabase);
    const insightsRepository = new InsightsRepository(supabase);
    const settingsRepository = new SettingsRepository(supabase);
    
    const analyticsService = new AnalyticsService(transactionRepository, budgetRepository);
    const settingsService = new SettingsService(settingsRepository);
    
    // Get user settings for currency
    const settings = await settingsService.getUserSettings(user.id);
    console.log(`✓ Currency: ${settings.currency}`);
    
    // Create LLM client
    let llmClient;
    try {
      llmClient = createLLMClient();
      if (options.verbose) {
        console.log(`✓ LLM client initialized (provider: ${process.env.AI_PROVIDER || 'openai'})`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize LLM client:', error instanceof Error ? error.message : error);
      console.log('💡 Make sure you have set the required environment variables:');
      console.log('   - AI_PROVIDER (openai or anthropic)');
      console.log('   - OPENAI_API_KEY or ANTHROPIC_API_KEY');
      return;
    }
    
    const aiInsightsService = new AIInsightsService(
      analyticsService,
      insightsRepository,
      settingsService,
      llmClient
    );
    
    // Generate insights
    console.log('\n🔮 Generating AI insights...');
    console.log('   This may take 10-30 seconds...');
    
    const startTime = Date.now();
    
    try {
      const insights = await aiInsightsService.generateInsights(user.id, {
        startDate: startDateStr,
        endDate: endDateStr,
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(`\n✅ AI insights generated successfully! (${duration}s)`);
      console.log('='.repeat(50));
      console.log('\n📊 INSIGHTS SUMMARY');
      console.log('='.repeat(50));
      console.log(`\n${insights.monthly_summary}\n`);
      
      if (insights.category_insights && insights.category_insights.length > 0) {
        console.log('📈 Category Insights:');
        insights.category_insights.forEach((cat, index) => {
          console.log(`   ${index + 1}. ${cat.category}: ${cat.total_spent.toFixed(2)} (${cat.percentage_of_total.toFixed(1)}%)`);
          if (options.verbose) {
            console.log(`      ${cat.insight}`);
          }
        });
        console.log('');
      }
      
      if (insights.spending_spikes && insights.spending_spikes.length > 0) {
        console.log('⚠️  Spending Alerts:');
        insights.spending_spikes.forEach((spike, index) => {
          console.log(`   ${index + 1}. ${spike.date} - ${spike.category}: ${spike.amount.toFixed(2)}`);
          if (options.verbose) {
            console.log(`      ${spike.description}`);
          }
        });
        console.log('');
      }
      
      if (insights.recommendations && insights.recommendations.length > 0) {
        console.log('💡 Recommendations:');
        insights.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
        console.log('');
      }
      
      if (insights.projections) {
        console.log('🔮 Projections:');
        console.log(`   Next Week: ${insights.projections.next_week.toFixed(2)}`);
        console.log(`   Next Month: ${insights.projections.next_month.toFixed(2)}`);
        console.log(`   Confidence: ${insights.projections.confidence.toUpperCase()}`);
        if (options.verbose) {
          console.log(`   ${insights.projections.explanation}`);
        }
        console.log('');
      }
      
      console.log('='.repeat(50));
      console.log(`✓ Insights stored with ID: ${insights.id}`);
      
    } catch (error) {
      console.error('\n❌ Error generating insights:', error instanceof Error ? error.message : error);
      
      if (options.verbose && error instanceof Error) {
        console.error('\nStack trace:', error.stack);
      }
      
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Verify your LLM API key is valid');
      console.log('   - Check your internet connection');
      console.log('   - Ensure you have sufficient API credits');
      console.log('   - Try running with --verbose for more details');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    if (options.verbose && error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Run the script
const options = parseArgs();

generateInsights(options)
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
