import os
import json
import time
import random
import urllib.request
import shutil
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_JSON = os.path.join(DATA_DIR, "musinsa_items.json")

# 남성(Men's) 랭킹 최적화 URL (gf=M 적용)
CATEGORY_MAP = {
    "Top": "https://www.musinsa.com/categories/item/001?gf=M",
    "Bottom": "https://www.musinsa.com/categories/item/003?gf=M"
}

def random_sleep(min_s=1, max_s=3):
    time.sleep(random.uniform(min_s, max_s))

def download_image(url, save_path):
    if url.startswith("//"):
        url = "https:" + url
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(save_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def crawl_category(page, cat_name, cat_url, existing_ids, limit=5):
    print(f"[{cat_name}] 카테고리 진입 중...")
    
    cat_asset_dir = os.path.join(ASSETS_DIR, cat_name)
    os.makedirs(cat_asset_dir, exist_ok=True)
    
    page.goto(cat_url)
    try:
        page.wait_for_selector("a[href*='/app/goods/'], a[href*='/products/']", timeout=10000)
    except:
        pass
    random_sleep(2, 4)
    
    product_links = page.query_selector_all("a[href*='/app/goods/'], a[href*='/products/']")
    url_list = []
    
    for link in product_links:
        href = link.get_attribute("href")
        if href and "javascript" not in href:
            if href.startswith("//"):
                href = "https:" + href
            if "musinsa.com" not in href:
                href = "https://www.musinsa.com" + href if href.startswith("/") else href
            
            # 기존 데이터에 이미 존재하는 item_id는 스킵 (누적 크롤링)
            item_id_cand = href.split("/")[-1].split("?")[0]
            if item_id_cand not in existing_ids and href not in url_list:
                url_list.append(href)
                
        if len(url_list) >= limit:
            break
            
    print(f"[{cat_name}] 신규 인기 남성복 상품 {len(url_list)}개 식별 완료.")
    
    results = []
    
    for idx, item_url in enumerate(url_list[:limit], 1):
        print(f"  -> Scraping [{idx}/{limit}]: {item_url}")
        
        page.goto(item_url)
        try:
            page.wait_for_selector("img", timeout=10000)
        except:
            pass
        random_sleep(1.5, 3)
        
        title = page.title().split(" - ")[0] if page.title() else "Unknown Title"
        item_id = item_url.split("/")[-1].split("?")[0]
        
        brand = "Musinsa Brand"
        price_val = random.choice([29000, 39000, 49000]) # PoC 용 랜덤 가격
        try:
            brand_node = page.query_selector(".product_article_contents a, a.brand-name")
            if brand_node: brand = brand_node.inner_text().strip()
                
            price_node = page.query_selector("#list_price, span.product_article_price")
            if price_node:
                raw_price = price_node.inner_text().replace(",", "").replace("원", "").strip()
                if raw_price.isdigit(): price_val = int(raw_price)
        except:
            pass
            
        images = []
        image_elements = page.query_selector_all("img")
        thumb_urls = []
        for img in image_elements:
            src = img.get_attribute("src")
            if src and ("image.msscdn.net" in src or "goods_" in src) and (".jpg" in src or ".png" in src):
                if src.startswith("//"):
                    src = "https:" + src
                if src not in thumb_urls and "gif" not in src:
                    thumb_urls.append(src)
        
        # 상단 이미지 최대 5개 추출
        thumb_urls = thumb_urls[:5]
        downloaded_paths = []
        for img_idx, url in enumerate(thumb_urls, 1):
            file_name = f"{cat_name}_Rank{idx}_{int(time.time())}_{item_id}_thumb{img_idx}.jpg"
            save_path = os.path.join(cat_asset_dir, file_name)
            download_image(url, save_path)
            # 백엔드 API에서 읽어갈 형태
            relative_path = f"assets/{cat_name}/{file_name}"
            downloaded_paths.append(relative_path)
        
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        random_sleep(2, 3)
        
        review_texts = []
        rev_elements = page.query_selector_all("p.review-profile__text, div.review-contents__text, p.review-content-body__text")
        for rev in rev_elements[:5]:
            text = rev.inner_text().strip()
            if text:
                review_texts.append(text)
                
        results.append({
            "item_id": item_id,
            "title": title,
            "brand": brand,
            "category": cat_name,
            "price": price_val,
            "url": item_url,
            "images": downloaded_paths,
            "reviews": review_texts
        })
        
        random_sleep(1, 2)
        
    return results

def main():
    print("=== [Fit & Fact] 무신사 순차 누적 크롤러 (New Items Only) ===")
    
    # ❌ 삭제: 기존 폴더 리셋 코드 삭제 (누적 저장을 위해)
    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 기존 데이터 로드 (중복 크롤링 방지용)
    existing_items = []
    existing_ids = set()
    if os.path.exists(OUTPUT_JSON):
        try:
            with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
                existing_items = json.load(f)
                for item in existing_items:
                    existing_ids.add(item["item_id"])
        except Exception as e:
            print(f"기존 JSON 로드 에러 (무시됨): {e}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        new_data = []
        for cat_name, url in CATEGORY_MAP.items():
            # existing_ids를 넘거주어 스킵된 제품 제외 "신규 5개"만 추출하도록 함
            data = crawl_category(page, cat_name, url, existing_ids, limit=5)
            new_data.extend(data)
            
        all_data = existing_items + new_data
        
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)
            
        browser.close()
        
    print(f"\n[완료] 신규 {len(new_data)}개 추가됨. (총 누적 데이터스택: {len(all_data)}개 기준)")

if __name__ == "__main__":
    main()
