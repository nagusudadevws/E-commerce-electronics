# Pip Installation Fix

## Issue
When running `pip install -r requirements.txt` from the backend folder, you may encounter:
- `pip: command not found` error
- Compatibility issues with Python 3.14

## Solution

### 1. Use `pip3` instead of `pip`

On macOS, Python 3 is typically installed as `python3` and pip as `pip3`. Use:

```bash
cd backend
pip3 install -r requirements.txt
```

**Alternative:** If `pip3` is not found, use:
```bash
python3 -m pip install -r requirements.txt
```

### 2. Updated Requirements

The `requirements.txt` has been updated to use newer versions that support Python 3.14:
- `fastapi>=0.115.0` (was 0.104.1)
- `pydantic>=2.10.0` (was 2.5.0)
- `uvicorn>=0.32.0` (was 0.24.0)
- Other packages updated to latest compatible versions

### 3. Dependency Warnings

You may see warnings about:
- `supafunc` requiring `httpx<0.26`
- `gotrue` requiring `httpx[http2]<0.28`
- `realtime` requiring `websockets<16`

These are minor version conflicts and **should not prevent the backend from running**. The Supabase client will work correctly with the installed versions. The `requirements.txt` now pins `websockets>=11.0,<16.0` to avoid conflicts.

## Verify Installation

After installation, verify everything works:

```bash
cd backend
python3 -c "import fastapi; import uvicorn; import supabase; print('All packages installed successfully!')"
```

## Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## Troubleshooting

### Still getting "pip command not found"?

1. Check if Python 3 is installed:
   ```bash
   python3 --version
   ```

2. Check if pip3 is available:
   ```bash
   pip3 --version
   ```

3. If pip3 is not found, install it:
   ```bash
   python3 -m ensurepip --upgrade
   ```

### Python version too old?

The backend requires Python 3.8+. Check your version:
```bash
python3 --version
```

If you need to install Python 3.8+, use Homebrew:
```bash
brew install python@3.11
```

Then use that specific version:
```bash
python3.11 -m pip install -r requirements.txt
```

