#!/usr/bin/env python3
"""
Project Manager - Automates GitHub project board management.

Requires GITHUB_TOKEN environment variable to be set.

Usage:
    python scripts/project_manager.py list-projects
    python scripts/project_manager.py add-issue --project-id <id> --issue <number>
    python scripts/project_manager.py label-issues --label "priority-high"

Environment:
    GITHUB_TOKEN: GitHub Personal Access Token with 'repo' and 'project' scopes
"""

import argparse
import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

REPO_OWNER = "canstralian"
REPO_NAME = "Stone-Legacy"
API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
GRAPHQL_URL = "https://api.github.com/graphql"


def get_token() -> str:
    """Get GitHub token from environment."""
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Error: GITHUB_TOKEN environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    return token


def rest_request(
    endpoint: str,
    method: str = "GET",
    data: dict | None = None,
) -> dict | list:
    """Make a GitHub REST API request."""
    token = get_token()
    url = f"{API_BASE}/{endpoint}" if not endpoint.startswith("http") else endpoint
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    body = json.dumps(data).encode() if data else None
    req = Request(url, data=body, headers=headers, method=method)

    try:
        with urlopen(req) as response:
            return json.loads(response.read().decode())
    except HTTPError as e:
        error_body = e.read().decode()
        print(f"API error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def graphql_request(query: str, variables: dict | None = None) -> dict:
    """Make a GitHub GraphQL API request."""
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    payload = {"query": query}
    if variables:
        payload["variables"] = variables

    body = json.dumps(payload).encode()
    req = Request(GRAPHQL_URL, data=body, headers=headers, method="POST")

    try:
        with urlopen(req) as response:
            result = json.loads(response.read().decode())
            if "errors" in result:
                print(f"GraphQL errors: {result['errors']}", file=sys.stderr)
                sys.exit(1)
            return result["data"]
    except HTTPError as e:
        error_body = e.read().decode()
        print(f"GraphQL error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)


def list_projects() -> None:
    """List all projects associated with the repository owner."""
    query = """
    query($owner: String!) {
        user(login: $owner) {
            projectsV2(first: 20) {
                nodes {
                    id
                    title
                    number
                    shortDescription
                    closed
                }
            }
        }
    }
    """
    data = graphql_request(query, {"owner": REPO_OWNER})
    projects = data["user"]["projectsV2"]["nodes"]

    if not projects:
        print("No projects found.")
        return

    print(f"{'ID':<40} {'#':<5} {'Title':<30} {'Status':<10}")
    print("-" * 85)
    for p in projects:
        status = "Closed" if p["closed"] else "Open"
        print(f"{p['id']:<40} {p['number']:<5} {p['title']:<30} {status:<10}")


def add_issue_to_project(project_id: str, issue_number: int) -> None:
    """Add an issue to a GitHub ProjectV2."""
    # First get the issue node ID
    query = """
    query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
            issue(number: $number) {
                id
                title
            }
        }
    }
    """
    data = graphql_request(
        query,
        {"owner": REPO_OWNER, "repo": REPO_NAME, "number": issue_number},
    )
    issue_id = data["repository"]["issue"]["id"]
    issue_title = data["repository"]["issue"]["title"]

    # Add to project
    mutation = """
    mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item {
                id
            }
        }
    }
    """
    graphql_request(mutation, {"projectId": project_id, "contentId": issue_id})
    print(f"Added issue #{issue_number} '{issue_title}' to project.")


def label_issues(label: str, add_labels: list[str] | None = None) -> None:
    """Find all issues with a given label and optionally add more labels."""
    issues = rest_request(f"issues?labels={label}&state=open")

    if not issues:
        print(f"No open issues found with label '{label}'.")
        return

    print(f"Found {len(issues)} open issues with label '{label}':")
    for issue in issues:
        print(f"  #{issue['number']}: {issue['title']}")

        if add_labels:
            existing = [l["name"] for l in issue["labels"]]
            new_labels = [l for l in add_labels if l not in existing]
            if new_labels:
                rest_request(
                    f"issues/{issue['number']}/labels",
                    method="POST",
                    data={"labels": new_labels},
                )
                print(f"    Added labels: {', '.join(new_labels)}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Manage GitHub projects and issue organization."
    )
    subparsers = parser.add_subparsers(dest="command")

    # List projects
    subparsers.add_parser("list-projects", help="List all GitHub projects")

    # Add issue to project
    add = subparsers.add_parser("add-issue", help="Add an issue to a project")
    add.add_argument("--project-id", required=True, help="ProjectV2 node ID")
    add.add_argument("--issue", type=int, required=True, help="Issue number")

    # Label management
    label = subparsers.add_parser("label-issues", help="Find/label issues")
    label.add_argument("--label", required=True, help="Label to search for")
    label.add_argument(
        "--add-labels", default="", help="Comma-separated labels to add"
    )

    args = parser.parse_args()

    if args.command == "list-projects":
        list_projects()
    elif args.command == "add-issue":
        add_issue_to_project(args.project_id, args.issue)
    elif args.command == "label-issues":
        add_labels = (
            [l.strip() for l in args.add_labels.split(",") if l.strip()]
            if args.add_labels
            else None
        )
        label_issues(args.label, add_labels)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
