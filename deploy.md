# 1. 원본(upstream)의 최신 내용 가져오기
git fetch upstream

# 2. 최신 내용을 반영하려는 브랜치로 이동
git checkout branch_name

# 3. 내 브랜치에 원본(upstream/branch_name)의 변경사항 병합하기
git merge upstream/branch_name

# 4. 최신화된 내용을 내 깃헙(origin)에 올리기
git push origin branch_name