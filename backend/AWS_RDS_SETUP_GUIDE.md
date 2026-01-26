# How to Create an AWS RDS MySQL Database (Free Tier)

Follow these steps to create a free MySQL database on AWS RDS for your MinihaAI project.

## Step 1: Login to AWS Console
1. Go to [aws.amazon.com/console](https://aws.amazon.com/console).
2. Sign in to your account.
3. In the search bar at the top, type **RDS** and click on "RDS (Managed Relational Database Service)".

## Step 2: Create Database
1. In the RDS Dashboard, click the **Create database** orange button.
2. **Choose a database creation method**: Select **Standard create**.
3. **Engine options**: Select **MySQL**.
4. **Edition**: Select **MySQL Community**.
5. **Version**: You can leave the default selected version (e.g., MySQL 8.0.x).

## Step 3: Templates
1. Select **Free tier**.
   * *Important: This ensures you stay within the free usage limits (750 hours/month).*

## Step 4: Settings
1. **DB instance identifier**: Enter a name for your instance, e.g., `minihaai-db`.
2. **Master username**: Leave as `admin` (or change if you prefer).
3. **Master password**: Enter a strong password. **Write this down!** You will need it for your `.env` file.
4. **Confirm password**: Re-enter the password.

## Step 5: Instance Configuration
1. **DB instance class**: Select **db.t3.micro** (or db.t2.micro if t3 is unavailable). This is the free tier eligible instance.

## Step 6: Connectivity (Crucial Step)
1. **Compute resource**: Select "Don't connect to an EC2 compute resource".
2. **VPC**: Leave default.
3. **Public access**: Select **Yes**.
   * *Required so you can connect from your local computer.*
4. **VPC security group**: Select "Create new".
5. **New VPC security group name**: Type `miniha-db-access`.
6. **Availability Zone**: No preference.

## Step 7: Additional Configuration (Don't Skip!)
1. Click on **Additional configuration** to expand the section.
2. **Initial database name**: Type `minihaai`.
   * *Crucial: If you leave this blank, AWS creates the instance but NO actual database inside it, and your app will fail to connect.*
3. Uncheck "Enable automated backups" if you want to avoid storage costs (optional, but recommended for dev).

## Step 8: Create
1. Scroll to the bottom showing "Estimated monthly costs". It should say "Free Tier".
2. Click **Create database**.

## Step 9: Get Connection Details
1. It will take 5-10 minutes to create. Wait until the "Status" changes from "Creating" to "Available".
2. Click on the database name (`minihaai-db`) to view details.
3. Look at the **Connectivity & security** tab.
4. Copy the **Endpoint** URL (e.g., `minihaai-db.xxxx.us-east-1.rds.amazonaws.com`).

## Step 10: Update Project `.env`
Go to your `backend/.env` file and update it:

```env
DB_HOST=paste-your-endpoint-here
DB_USER=admin
DB_PASSWORD=your-password-from-step-4
DB_NAME=minihaai
```

## Troubleshooting Connection
If you cannot connect:
1. Go to RDS > Databases > Click your DB.
2. Click on the "VPC security groups" link (e.g., `sg-xxxx`).
3. Select the Security Group > click **Inbound rules** tab > **Edit inbound rules**.
4. Add Rule:
   * **Type**: MySQL/Aurora (3306)
   * **Source**: My IP (This allows only your computer to access it).
5. Save rules.
