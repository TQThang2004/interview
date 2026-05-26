1. ### What is Git and how does it differ from SVN (or traditional centralized VCS)?

    Git is a Distributed Version Control System (DVCS). Unlike SVN, which is a Centralized system where everyone shares a single central server, Git provides every developer with a full clone of the entire project repository history locally on their machine. This allows developers to work offline, commit faster, and eliminates the risk of data loss if the main server crashes.

2. ### What is the difference between Git and GitHub/GitLab?

    * Git: A local software tool installed on your computer used to track file changes and manage version history.
    GitHub/GitLab: Cloud-based hosting services built to store and manage remote Git repositories, facilitating team collaboration and code sharing.

3. ### Explain the Three States (or Areas) in Git.

    Git manages files across three distinct areas:
    Working Directory: The local sandbox where you directly add, delete, and modify project files on your hard drive.
    Staging Area (Index): A preparation zone that tracks which file modifications will be included in the next snapshot (operated via git add).
    Local Repository: The permanent storage area where Git saves snapshots of your project as commits (operated via git commit).

4. ### What is the purpose of the git init command?

    This command initializes a brand-new Git repository in your current directory. Git creates a hidden .git folder containing all version history data and configuration files for the project.

5. ### How does the git clone command work?

    It copies an existing Remote Repository down to your local machine. It doesn't just download the latest version of the files; it pulls down the entire commit history and all branches associated with that project.

6. ### What is a "Commit" in Git?

    A commit is a snapshot of your project's files at a specific point in time. Each commit is identified by a unique SHA-1 hash, and records structural changes along with metadata such as the author, timestamp, and a commit message.

7. ### Differentiate between these file states: Tracked, Untracked, Staged, and Modified.

    Untracked: A newly created file that Git is not yet aware of.
    Tracked: A file that is already a part of Git's version tracking system.
    Modified: A tracked file that has been edited in the Working Directory but hasn't been moved to the Staging Area yet.
    Staged: A modified file that has been added to the Staging Area and is ready to be committed.

8. ### What is a .gitignore file? Provide examples.

    A .gitignore file contains a list of patterns specifying which files or directories Git should intentionally ignore and never track (e.g., the node_modules/ folder, local environment files like .env, compilation outputs like dist/, or system log files).

9. ### What does the git status command do?

    It displays the current state of the Working Directory and the Staging Area. It highlights which files have been modified, which are staged for the next commit, and which files are currently untracked.

10. ### What is the difference between git add . and git add -A?

    Since Git version 2.0, both commands behave identically: they stage all new, modified, and deleted files within the entire project directory structure into the Staging Area.

11. ### How do you write a standard, high-quality Commit Message?

    A good commit message should be concise but descriptive (typically under 50 characters for the subject line) and written in the imperative mood (e.g., "Fix login bug" instead of "Fixed login bug"). If necessary, add a blank line followed by a body explaining the why behind the change, rather than just the what.

12. ### What is the HEAD pointer in Git?

    HEAD is a pointer referencing the specific commit you are currently working on in your Working Directory. By default, HEAD points to the tip (the latest commit) of your currently active branch.

13. ### What is the purpose of the git log command?

    It displays the commit history of the current branch in reverse chronological order (newest first), detailing the SHA-1 hash, author, date, and commit message for each entry.

14. ### How can you view the specific line changes made to a file before committing it?

    Use the git diff command. It presents line-by-line differences, showing added code (in green) and deleted code (in red) between your Working Directory and the Staging Area.

15. ### What are the main types of Repositories in Git?

    There are two types:
    Local Repository: Hosted directly on an individual developer's computer.
    Remote Repository: Hosted on a shared network server (like GitHub, GitLab, or Bitbucket) for team synchronization.
    

## Section 2: Branching & Merging (Questions 16 - 30)



16. ### What is a Branch in Git?

    Under the hood, a branch in Git is simply a lightweight, movable pointer to a specific commit. Creating branches allows you to isolate a new stream of work to build features or fix bugs without affecting the stable main production code.

17. ### How do you create a new branch and switch to it immediately?

    * The traditional way: git branch <branch_name> followed by git checkout <branch_name>.
    The combined shorthand: git checkout -b <branch_name> or git switch -c <branch_name>.

18. ### What is the difference between git checkout and git switch?

    git checkout is a multi-purpose command (used for switching branches, restoring files, etc.). To clear up confusion, modern versions of Git introduced git switch, which is explicitly dedicated only to switching between branches.

19. ### What does the git merge command do?

    It integrates the commit history and source code modifications of a specified target branch into your currently active branch.

20. ### Differentiate between a Fast-Forward Merge and a Three-Way Merge.

    Fast-Forward Merge: Occurs if the source branch hasn't diverged (received new commits) since the target branch was split off. Git simply moves the source branch pointer forward to the tip of the target branch.
    Three-Way Merge: Occurs when both branches have diverged with independent commits. Git finds their common ancestor commit and creates a brand-new "Merge Commit" to bind both histories together.

21. ### What is a Merge Conflict and why does it occur?

    A merge conflict occurs when two branches modify the exact same line of code in the same file, or when one branch deletes a file that another branch is trying to edit. Because Git cannot programmatically determine which version is correct, it pauses the merge process and requires human intervention.

22. ### What are the steps to resolve a Merge Conflict?

    1. Run git status to locate the conflicted files (marked as unmerged paths).

23. ### Open those files in an editor and locate the conflict markers (<<<<<<<, =======, >>>>>>>).


24. ### Manually edit the code to keep the desired changes, remove the undesired code, and delete Git's conflict markers.


25. ### Save the file and run git add <file_name> to mark the conflict as resolved.


26. ### Run git commit to complete the merge commit process.


27. ### What is git rebase and how does it differ from git merge?

    * git merge combines branches by generating a new merge commit, preserving the actual historical timeline of how the branches diverged.
    git rebase takes all new commits from your current branch and replays them on top of the tip of the target branch. It rewrites the commit history into a clean, linear path but obscures the true historical sequence of branch splitting.

28. ### What is the Golden Rule of Git Rebase?

    Never rebase a public branch (like main or master) that other team members are actively collaborating on. Rewriting shared history forces everyone else to manually stitch their local histories back together, causing severe disruption.

29. ### How do you delete a branch both locally and remotely?

    Delete a local branch: git branch -d <branch_name> (use -D to force delete if the branch has unmerged work).
    Delete a remote branch: git push origin --delete <branch_name>.

30. ### When would you use the git cherry-pick command?

    You use it when you want to copy one specific commit from an entirely separate branch and apply it directly onto your current branch, without executing a full merge of that entire branch.

31. ### What is the difference between git fetch and git pull?

    git fetch downloads the latest updates from the Remote Server to your Local Repository but does not alter your Working Directory. It allows you to inspect changes before merging.
    git pull is a combined shorthand for git fetch followed immediately by git merge. It downloads remote changes and instantly forces a merge into your active local branch.

32. ### What does the git push command do?

    It uploads your local repository commits to a Remote Repository (like GitHub) so that your team members can access the updated codebase.

33. ### What is the purpose of the git remote -v command?

    It lists all the configured remote server connections mapped to your local repository, displaying their URL paths for both fetching and pushing operations.

34. ### What does "origin" signify in the command git push origin main?

    origin is the default alias (or nickname) that Git gives to the URL of the Remote Repository from which you initially cloned the project.
    

## Section 3: Data Recovery & Reverting Mistakes (Questions 31 - 40)



35. ### When should you use the git stash command?

    Use it when you have uncommitted, messy changes on your active branch but need to quickly switch branches to work on an urgent bug fix. Running git stash temporarily saves your uncommitted changes to an internal stack, reverting your Working Directory to a clean state. Once finished elsewhere, switch back and run git stash pop to restore your work.

36. ### What is the difference between git stash apply and git stash pop?

    * git stash pop applies the most recently stashed changes back into your working code and permanently removes that stash entry from the stash stack.
    git stash apply applies the stashed changes into your working code but retains the backup copy in the stash stack for future reuse.

37. ### How do you modify a commit message you just created (before pushing it online)?

    Run the command git commit --amend -m "New descriptive message". This replaces the previous commit with a new one containing the updated message without inflating your commit history.

38. ### What are the different modes of the git reset command?

    There are three primary modes:
    --soft: Moves the HEAD pointer back to a prior commit, leaving all your modified file changes intact and staged in the Staging Area (no code is lost).
    --mixed (default): Moves HEAD back, but unstages all modifications, pushing them back to your Working Directory (no code is lost).
    --hard: Obliterates all modifications; resets both the Staging Area and the Working Directory to match the specified historical commit (uncommitted changes are permanently lost).

39. ### How does git revert work, and how does it differ from git reset?

    * git reset structurally deletes or alters history by moving branch pointers backward (best for unpushed local changes).
    git revert undoes the changes of a target commit by generating a brand-new inverse commit. It does not delete historical entries, making it safe for public, shared remote branches.

40. ### How do you unstage a file that you accidentally ran git add on?

    Run the command git restore --staged <file_name> (or the older alternative git reset HEAD <file_name>). This removes the file from the Staging Area while keeping your edits in the Working Directory.

41. ### How do you discard all uncommitted changes made to a single file and restore it to the state of the last commit?

    Run git restore <file_name> (or the older alternative git checkout -- <file_name>). This permanently wipes out any uncommitted edits made to that file.

42. ### If you mistakenly perform a git reset --hard and lose commits, can you recover them?

    Yes, provided the commits existed locally. You can use git reflog to view a comprehensive log of every movement made by the HEAD pointer (including references to deleted commits). Find the SHA-1 hash of the lost commit from the log, and run git reset --hard <sha_hash> to restore it.

43. ### What does the git clean command do?

    It cleans up your Working Directory by recursively deleting files that are not tracked under Git version control. Running git clean -fd forces the removal of both untracked files and directories.

44. ### How do you remove a file from Git tracking while keeping the actual file on your local hard drive?

    Run git rm --cached <file_name>. The file will be deleted from the repository repository on subsequent commits, but the physical file remains untouched on your computer.
    

## Section 4: Advanced Features & Team Workflow (Questions 41 - 50)



45. ### What is a Git Tag? Differentiate between a Lightweight Tag and an Annotated Tag.

    A tag points to a specific important commit in history, typically used to mark release versions (e.g., v1.0.0).
    Lightweight Tag: A simple pointer directly to a commit, similar to a branch that does not move.
    Annotated Tag: Stored as a full object in the Git database. It tracks who created it, the date, a tag message, and can be cryptographically signed using GPG.

46. ### What is the purpose of the git blame command?

    It annotates each line of a specified file, showing the author, timestamp, and commit hash of the individual who last modified that line. It is useful for tracing code changes or identifying who to talk to about a bug.

47. ### How does git bisect work and when should it be used?

    Use it to locate which historical commit introduced a bug via a binary search. You give Git a known "good" commit from the past and a "bad" commit where the bug is visible. Git checks out a commit in the middle; you test it and mark it as "good" or "bad". Git repeats this process until it isolates the exact commit that introduced the bug.

48. ### What is a Git Submodule?

    A Git Submodule allows you to embed a separate external Git repository (e.g., a shared utility library) inside a subdirectory of your main project repository, while maintaining independent commit histories for both.

49. ### Why is git push -f (Force Push) dangerous, and when is it acceptable to use?

    Force-pushing overrides the remote server's commit history with your local history, potentially deleting commits made by your colleagues. It is highly dangerous on shared public branches. It is only acceptable on your isolated, personal feature branches (for example, after cleaning up history with an interactive rebase).

50. ### What does a "Detached HEAD" state mean? How do you fix it?

    It means your HEAD pointer is referencing a specific concrete commit hash directly, rather than pointing to a named Branch pointer. Any new commits made in this state will become orphaned when you switch away. To fix it, simply switch back to an existing branch using git switch <branch_name>.

51. ### What are the most common Git workflows used in the industry?

    Common branching models include:
    Git Flow: Utilizes highly structured, dedicated branches (main, develop, feature, release, hotfix). Ideal for structured, scheduled product release cycles.
    GitHub Flow: A streamlined model where feature branches are branched directly from main and immediately opened as Pull Requests to be reviewed and merged back to main. Ideal for web applications with continuous deployment (CI/CD).

52. ### How do you compress multiple small local commits into a single clean commit before pushing?

    Use an Interactive Rebase via the command git rebase -i HEAD~<number_of_commits>. In the interactive configuration window that appears, change the command keyword from pick to squash (or s) for the lower commits to merge them into the uppermost parent commit.

53. ### What is a Pull Request (PR) or Merge Request (MR)?

    It is a feature native to code collaboration platforms (like GitHub or GitLab). It is a formal request submitted by a developer asking maintainers to review code built on an isolated branch before it is officially merged into the primary repository branch.

54. ### How do you update the destination URL of an existing Remote configuration?

    Execute the command: git remote set-url origin <new_remote_url>. You can confirm the successful path update by verifying with git remote -v.

