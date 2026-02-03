# MCP (Model Context Protocol) Servers
## Configuration & Setup Guide

---

## Overview

MCP (Model Context Protocol) servers allow AI assistants to interact with your codebase, tools, and services. This document outlines how to configure MCP servers for the Multi-Vendor E-Commerce Platform project.

---

## What are MCP Servers?

MCP servers are standardized interfaces that enable AI assistants (like Claude, ChatGPT, etc.) to:
- Access your codebase and files
- Execute commands and tools
- Query databases
- Interact with APIs
- Provide context-aware assistance

---

## Recommended MCP Servers for This Project

### 1. Filesystem Server
**Purpose**: Read and write files in the project

**Configuration** (for Cursor/Claude Desktop):
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    }
  }
}
```

### 2. Git Server
**Purpose**: Interact with Git repository

**Configuration**:
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    }
  }
}
```

### 3. PostgreSQL Server (for Supabase)
**Purpose**: Query database directly, run migrations, analyze schema

**Configuration**:
```json
{
  "mcpServers": {
    "supabase-postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
      }
    }
  }
}
```

**Note**: Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual Supabase credentials.

### 4. GitHub Server
**Purpose**: Interact with GitHub (if using GitHub)

**Configuration**:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token"
      }
    }
  }
}
```

### 5. Brave Search Server
**Purpose**: Search the web for documentation and solutions

**Configuration**:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "your_brave_api_key"
      }
    }
  }
}
```

---

## Supabase MCP Server Setup (Detailed Guide)

### Step 1: Get Your Supabase Connection String

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Navigate to Database Settings**
   - Go to: **Settings** → **Database**
   - Scroll to **Connection string** section

3. **Choose Connection Method**

   **Option A: Direct Connection (Recommended for MCP)**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```
   - Use this for direct database access
   - Replace `[YOUR-PASSWORD]` with your database password
   - Replace `[PROJECT-REF]` with your project reference ID

   **Option B: Connection Pooler (For production)**
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   - Use connection pooler for better performance
   - Port: `6543` (transaction mode) or `5432` (session mode)

4. **Get Your Database Password**
   - If you forgot your password, go to: **Settings** → **Database** → **Database password**
   - You can reset it if needed (be careful - this affects all connections)

5. **Get Your Project Reference**
   - Found in: **Settings** → **General** → **Reference ID**
   - Format: `abcdefghijklmnop` (alphanumeric string)

### Step 2: Create Connection String

**Format**:
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

**Example**:
```
postgresql://postgres:MySecurePassword123@abcdefghijklmnop.supabase.co:5432/postgres
```

### Step 3: Configure MCP Server

#### For Cursor IDE

Create or edit: `~/.cursor/mcp.json` (macOS/Linux) or `%APPDATA%\Cursor\mcp.json` (Windows)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
      }
    }
  }
}
```

#### For Claude Desktop

Create or edit: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
      }
    }
  }
}
```

### Step 4: Secure Your Connection String

**Option 1: Use Environment Variables (Recommended)**

1. Create a `.env.mcp` file in your project root:
```env
SUPABASE_DB_PASSWORD=your_actual_password
SUPABASE_PROJECT_REF=your_project_ref
```

2. Update MCP config to use environment variable:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:${SUPABASE_DB_PASSWORD}@${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"
      }
    }
  }
}
```

**Option 2: Use System Environment Variables**

```bash
# macOS/Linux - Add to ~/.zshrc or ~/.bashrc
export SUPABASE_DB_PASSWORD="your_password"
export SUPABASE_PROJECT_REF="your_project_ref"
```

Then reference in config:
```json
{
  "env": {
    "POSTGRES_CONNECTION_STRING": "postgresql://postgres:${SUPABASE_DB_PASSWORD}@${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"
  }
}
```

### Step 5: Test the Connection

1. **Restart your IDE** (Cursor/Claude Desktop)

2. **Verify MCP Server is Connected**
   - Check MCP server status in IDE
   - Look for "supabase" or "postgres" in available tools

3. **Test with a Query**
   Ask your AI assistant:
   ```
   "List all tables in the Supabase database"
   ```
   or
   ```
   "Show me the schema of the products table"
   ```

### Step 6: Available MCP Tools for Supabase

Once connected, you can use these tools:

- **Query Database**: Run SQL queries
- **List Tables**: Get all table names
- **Describe Table**: Get table schema
- **Execute SQL**: Run custom SQL commands
- **Get Table Data**: Query specific tables

### Example Queries You Can Run

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Get products table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products';

-- Count products
SELECT COUNT(*) FROM products;

-- Get recent orders
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Security Best Practices

1. **Never Commit Connection Strings**
   - Add `.env.mcp` to `.gitignore`
   - Never commit MCP config files with passwords

2. **Use Read-Only Access When Possible**
   - Create a read-only database user for MCP
   - Limit permissions to necessary tables

3. **Rotate Passwords Regularly**
   - Change database password periodically
   - Update MCP config after password change

4. **Use Connection Pooler for Production**
   - Better performance
   - Connection limits
   - Better security

5. **Restrict IP Access (Optional)**
   - In Supabase Dashboard: **Settings** → **Database** → **Connection Pooling**
   - Configure IP allowlist if needed

### Troubleshooting Supabase Connection

#### Issue: Connection Timeout
**Solution**:
- Check your internet connection
- Verify Supabase project is active
- Try connection pooler instead of direct connection

#### Issue: Authentication Failed
**Solution**:
- Verify password is correct (no extra spaces)
- Check project reference ID
- Reset database password if needed

#### Issue: SSL Required
**Solution**:
- Supabase requires SSL connections
- Add `?sslmode=require` to connection string:
```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

#### Issue: Permission Denied
**Solution**:
- Verify you're using the correct database user
- Check Row Level Security (RLS) policies
- Ensure user has necessary permissions

### Alternative: Supabase REST API MCP Server

If you prefer using Supabase REST API instead of direct database access:

```json
{
  "mcpServers": {
    "supabase-api": {
      "command": "node",
      "args": [
        "./mcp-servers/supabase-api-server.js"
      ],
      "env": {
        "SUPABASE_URL": "https://[PROJECT-REF].supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
      }
    }
  }
}
```

**Benefits**:
- Uses Supabase REST API
- Respects RLS policies
- Better security model
- Easier to implement

---

## Complete MCP Configuration

### For Cursor IDE

Create or edit: `~/.cursor/mcp.json` (macOS/Linux) or `%APPDATA%\Cursor\mcp.json` (Windows)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
      }
    }
  }
}
```

### For Claude Desktop

Create or edit: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        "/Users/savyaskanda/Documents/Nagu_DEV_WS/e-commerce-website-3"
      ]
    }
  }
}
```

---

## Project-Specific MCP Servers

### Custom E-Commerce MCP Server (Optional)

You can create a custom MCP server for project-specific tools:

**File: `mcp-server/index.js`**
```javascript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "ecommerce-platform-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_product_count",
      description: "Get the total number of products in the database",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_order_stats",
      description: "Get order statistics",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filter by order status",
          },
        },
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get_product_count":
      // Implement logic to query Supabase
      return {
        content: [
          {
            type: "text",
            text: "Total products: 150",
          },
        ],
      };

    case "get_order_stats":
      // Implement logic to query orders
      return {
        content: [
          {
            type: "text",
            text: `Orders with status ${args.status}: 25`,
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("E-Commerce MCP server running on stdio");
}

main().catch(console.error);
```

**Package.json for custom server:**
```json
{
  "name": "ecommerce-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## Environment Variables for MCP Servers

Create a `.env.mcp` file (optional, for sensitive data):

```env
# Supabase Connection (for PostgreSQL MCP server)
POSTGRES_CONNECTION_STRING=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# GitHub Token (for GitHub MCP server)
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token

# Brave Search API (for search MCP server)
BRAVE_API_KEY=your_brave_api_key

# Supabase Keys (for custom MCP server)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Setup Instructions

### 1. Install MCP Server Packages

```bash
# Install globally (optional)
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-postgres
```

Or use `npx` (recommended) - no installation needed.

### 2. Configure Your IDE/Client

#### For Cursor:
1. Open Cursor Settings
2. Navigate to MCP Settings
3. Add server configurations
4. Restart Cursor

#### For Claude Desktop:
1. Edit the config file at:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
2. Add MCP server configurations
3. Restart Claude Desktop

### 3. Verify Configuration

After restarting, you should see MCP servers listed in your AI assistant's available tools.

---

## Use Cases for This Project

### 1. Code Generation
- Generate components following UI/UX guidelines
- Create database queries with proper types
- Generate API endpoints with FastAPI

### 2. Code Review
- Analyze code for consistency
- Check adherence to design system
- Review security best practices

### 3. Documentation
- Generate documentation from code
- Update phase documentation
- Create API documentation

### 4. Database Operations
- Query Supabase database
- Generate migration scripts
- Analyze database schema

### 5. Git Operations
- Create commits with proper messages
- Generate branch names
- Review git history

---

## Security Considerations

### 1. Environment Variables
- Never commit `.env.mcp` or config files with secrets
- Use environment variables for sensitive data
- Rotate API keys regularly

### 2. File Access
- Limit filesystem access to project directory only
- Be cautious with write permissions
- Review file changes before committing

### 3. Database Access
- Use read-only connections when possible
- Limit database access to necessary tables
- Use service role key only in secure environments
- **For Supabase**: Consider using connection pooler for better security and performance
- Enable IP restrictions in Supabase dashboard if needed

---

## Troubleshooting

### MCP Server Not Connecting

1. **Check Node.js version**: Ensure Node.js 18+ is installed
   ```bash
   node --version
   ```

2. **Verify configuration syntax**: JSON must be valid
   ```bash
   # Test JSON syntax
   cat ~/.cursor/mcp.json | jq .
   ```

3. **Check server logs**: Look for error messages in IDE console

4. **Verify paths**: Ensure all file paths are absolute and correct

### Permission Issues

1. **Filesystem access**: Ensure the project directory is accessible
2. **Git access**: Verify Git repository is initialized
3. **Database access**: Check connection string and credentials

### Server Timeout

1. **Increase timeout**: Some servers may need more time
2. **Check network**: Ensure internet connection for remote servers
3. **Restart IDE**: Sometimes a restart resolves connection issues

---

## Best Practices

### 1. Start Simple
- Begin with filesystem and git servers
- Add more servers as needed
- Test each server individually

### 2. Use Environment Variables
- Store sensitive data in environment variables
- Never hardcode API keys or passwords
- Use `.env` files with proper `.gitignore`

### 3. Regular Updates
- Keep MCP server packages updated
- Review server capabilities regularly
- Update configuration as needed

### 4. Documentation
- Document custom MCP servers
- Keep configuration files in version control (without secrets)
- Share configuration with team

---

## Resources

### Official Documentation
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Servers Directory](https://github.com/modelcontextprotocol/servers)

### Community Servers
- [Awesome MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Server Examples](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/examples)

### Project-Specific
- This project's MCP configuration
- Custom server implementations (if created)

---

## Quick Reference

### Common MCP Commands

```bash
# Test filesystem server
npx -y @modelcontextprotocol/server-filesystem /path/to/project

# Test git server
npx -y @modelcontextprotocol/server-git --repository /path/to/project

# Test postgres server
npx -y @modelcontextprotocol/server-postgres
```

### Configuration File Locations

- **Cursor**: `~/.cursor/mcp.json` (macOS/Linux)
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
- **VS Code**: Extension-specific configuration

---

## Quick Reference: Supabase MCP Setup

### Quick Setup Checklist

1. ✅ Get Supabase connection string from Dashboard
2. ✅ Create MCP config file (`~/.cursor/mcp.json` or Claude Desktop config)
3. ✅ Add Supabase server configuration
4. ✅ Set `POSTGRES_CONNECTION_STRING` environment variable
5. ✅ Restart IDE
6. ✅ Test connection with a query

### Connection String Format

```
postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
```

### Where to Find Credentials

- **Password**: Settings → Database → Database password
- **Project Ref**: Settings → General → Reference ID
- **Connection String**: Settings → Database → Connection string

### Minimal Config Example

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_REF.supabase.co:5432/postgres"
      }
    }
  }
}
```

### Test Query

Once connected, try:
```
"Show me all tables in the database"
"Describe the products table schema"
"Count the number of products"
```

---

**Last Updated**: 2024  
**Status**: Active Configuration  
**Applies To**: AI-Assisted Development

