---
name: GitHub access layers
description: Distinguishing GitHub account authorization from usable workspace and repository access.
---

Do not treat a healthy GitHub account authorization as proof that the workspace
CLI can access a repository, or a missing CLI login as proof that OAuth expired.

**Why:** The source-control integration reported active/healthy while GitHub CLI
API commands reported no authentication. The reconnect form then said the
integration was not connected, while its first-time form rejected the connection
ID because it required a connector ID. The directory exposed only the connection,
not a valid connector setup target.

**How to apply:** Check whether an actual GitHub repository is configured and
obtain the intended repository URL before attempting repository operations.
Verify access to that repository. If setup tools contradict each other, stop
repeating forms; explain the blocker and use the Git pane connection flow.
Never invent connector IDs, hunt for tokens or claim a cloud build ran merely
because its workflow file exists.
