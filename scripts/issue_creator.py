#!/usr/bin/env python3
"""
Issue Creator - Automates GitHub issue creation via the API.

Requires GITHUB_TOKEN environment variable to be set.

Usage:
    python scripts/issue_creator.py --title "Bug: login fails" --body "Description" --labels bug,urgent
    python scripts/issue_creator.py --from-file issues.json

Environment:
    GITHUB_TOKEN: GitHub Personal Access Token with 'repo' scope
"""

import argparse
import json
import os
import sys
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError

REPO_OWNER = "canstralian"
REPO_NAME = "Stone-Legacy"
API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"


def get_token() -> str:
    """Get GitHub token from environment."""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Error: GITHUB_TOKEN environment variable is not set.", file=sys.stderr)
        print("Set it with: export GITHUB_TOKEN=your_token_here", file=sys.stderr)
        sys.exit(1)
    return token


def api_request(
    endpoint: str,
    method: str = "GET",
    data: dict | None = None,
    token: str = "",
) -> dict:
    """Make a GitHub API request with retry logic."""
    url = f"{API_BASE}/{endpoint}" if not endpoint.startswith("http") else endpoint
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, headers=headers, method=method)

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urlopen(req) as response:
                return json.loads(response.read().decode())
        except HTTPError as e:
            if e.code == 403 and "rate limit" in str(e.read().decode()).lower():
                wait = 2 ** (attempt + 1)
                print(f"Rate limited. Retrying in {wait}s...")
                time.sleep(wait)
                continue
            error_body = e.read().decode()
            print(f"API error {e.code}: {error_body}", file=sys.stderr)
            sys.exit(1)

    print("Max retries exceeded.", file=sys.stderr)
    sys.exit(1)


def create_issue(
    title: str,
    body: str = "",
    labels: list[str] | None = None,
    assignees: list[str] | None = None,
) -> dict:
    """Create a single GitHub issue."""
    token = get_token()
    data = {"title": title, "body": body}

    if labels:
        data["labels"] = labels
    if assignees:
        data["assignees"] = assignees

    result = api_request("issues", method="POST", data=data, token=token)
    print(f"Created: {result['html_url']}")
    return result


def create_issues_from_file(filepath: str) -> None:
    """Create multiple issues from a JSON file.

    Expected format:
    [
        {"title": "Issue 1", "body": "Description", "labels": ["bug"]},
        {"title": "Issue 2", "body": "Description", "labels": ["enhancement"]}
    ]
    """
    with open(filepath) as f:
        issues = json.load(f)

    if not isinstance(issues, list):
        print("Error: JSON file must contain an array of issues.", file=sys.stderr)
        sys.exit(1)

    for i, issue in enumerate(issues):
        if "title" not in issue:
            print(f"Skipping issue {i}: missing 'title' field.", file=sys.stderr)
            continue
        create_issue(
            title=issue["title"],
            body=issue.get("body", ""),
            labels=issue.get("labels"),
            assignees=issue.get("assignees"),
        )
        # Small delay to avoid rate limiting
        time.sleep(1)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create GitHub issues via the API."
    )
    subparsers = parser.add_subparsers(dest="command")

    # Single issue creation
    single = subparsers.add_parser("create", help="Create a single issue")
    single.add_argument("--title", required=True, help="Issue title")
    single.add_argument("--body", default="", help="Issue body/description")
    single.add_argument(
        "--labels", default="", help="Comma-separated labels"
    )
    single.add_argument(
        "--assignees", default="", help="Comma-separated assignees"
    )

    # Batch issue creation
    batch = subparsers.add_parser("batch", help="Create issues from a JSON file")
    batch.add_argument("--file", required=True, help="Path to JSON file")

    args = parser.parse_args()

    if args.command == "create":
        labels = [l.strip() for l in args.labels.split(",") if l.strip()]
        assignees = [a.strip() for a in args.assignees.split(",") if a.strip()]
        create_issue(args.title, args.body, labels or None, assignees or None)
    elif args.command == "batch":
        create_issues_from_file(args.file)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
