#!/usr/bin/env python3
"""
Branch Creator - Automates Git branch creation from a base branch.

Usage:
    python scripts/branch_creator.py <branch_name> [--base <base_branch>] [--push]

Examples:
    python scripts/branch_creator.py feature/user-auth
    python scripts/branch_creator.py bugfix/login-error --base develop
    python scripts/branch_creator.py feature/new-ui --push
"""

import argparse
import subprocess
import sys
import re


def run_git(args: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a git command and return the result."""
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        check=False,
    )
    if check and result.returncode != 0:
        print(f"Error: git {' '.join(args)}", file=sys.stderr)
        print(result.stderr.strip(), file=sys.stderr)
        sys.exit(1)
    return result


def sanitize_branch_name(name: str) -> str:
    """Sanitize a string into a valid git branch name."""
    sanitized = re.sub(r"[^a-zA-Z0-9/_-]", "-", name)
    sanitized = re.sub(r"-{2,}", "-", sanitized)
    sanitized = sanitized.strip("-")
    return sanitized


def branch_exists(branch_name: str) -> bool:
    """Check if a branch already exists locally or remotely."""
    local = run_git(["branch", "--list", branch_name], check=False)
    if local.stdout.strip():
        return True

    remote = run_git(
        ["ls-remote", "--heads", "origin", branch_name], check=False
    )
    return bool(remote.stdout.strip())


def create_branch(branch_name: str, base_branch: str, push: bool) -> None:
    """Create a new branch from the specified base branch."""
    branch_name = sanitize_branch_name(branch_name)

    if branch_exists(branch_name):
        print(f"Branch '{branch_name}' already exists.")
        sys.exit(1)

    print(f"Fetching latest from origin/{base_branch}...")
    run_git(["fetch", "origin", base_branch])

    print(f"Creating branch '{branch_name}' from 'origin/{base_branch}'...")
    run_git(["checkout", "-b", branch_name, f"origin/{base_branch}"])

    if push:
        print(f"Pushing '{branch_name}' to origin...")
        run_git(["push", "-u", "origin", branch_name])

    print(f"Branch '{branch_name}' created successfully.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a new Git branch from a base branch."
    )
    parser.add_argument("branch_name", help="Name of the new branch to create")
    parser.add_argument(
        "--base",
        default="main",
        help="Base branch to create from (default: main)",
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Push the new branch to origin after creation",
    )

    args = parser.parse_args()
    create_branch(args.branch_name, args.base, args.push)


if __name__ == "__main__":
    main()
