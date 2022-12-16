import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()
from pybo.models import *
import pandas as pd
import os
from datetime import datetime

news_dir_path = r"C:\Users\jhyun\PycharmProjects\projects\news_data\뉴스데이터모음"
press_dir_path = r"C:\Users\jhyun\PycharmProjects\projects\press_release\result"
ls_news_file_path = []
ls_press_file_path = []
for (root, directories,files) in os.walk(news_dir_path):
    for file in files:
        file_path = os.path.join(root, file)
        ls_news_file_path.append(file_path)

for (root, directories,files) in os.walk(press_dir_path):
    for file in files:
        file_path = os.path.join(root, file)
        ls_press_file_path.append(file_path)

ls_press_file_path.sort()
ls_news_file_path.sort()

##### 수정할 값 #########################################
# done: 0
startIndex = 1

'''
for path_ind in range(startIndex, len(ls_news_file_path)):
    path = ls_news_file_path[path_ind]
    print("START::"+path)
    news = pd.read_csv(path, names=['dummy', '일자', '언론사', '기고자', '제목', '본문', 'URL', '키워드10개'], encoding='cp949', skiprows=[0])
    for i in range(1, len(news)):
        news_csv_data = news.iloc[i]
        news_title = news_csv_data['제목']
        news_description = news_csv_data['본문']
        news_url = news_csv_data['URL']
        news_date = news_csv_data['일자']
        news_com = news_csv_data['언론사']
        news_similarity = 0.0
        news_keyword = news_csv_data['키워드10개']
        nullcheck = [news_title, news_description, news_url, news_date, news_com, news_similarity, news_keyword]
        flag = True
        for x in nullcheck:
            if pd.isna(x):
                print("ERROR:: at "+path+"   row "+str(i))
                flag=False
                break
        if flag == False:
            continue
        try:
            date_time_obj = datetime.strptime(str(news_date), '%Y%m%d')  #####
        except:
            print("ERROR:: at " + path + "   row " + str(i))
            continue

        # DB에 인서트
        news_data = News(title=news_title, description=news_description, url=news_url, date=date_time_obj, news_com=news_com, similarity=news_similarity, keyword=news_keyword)
        news_data.save()
    print("END::"+path)

'''
for path in ls_press_file_path:
    press = pd.read_csv(path, names=['발행일', '제목', '본문', '보도자료페이지링크', '보도자료hwp링크', '키워드(10개)'], encoding='UTF-8-sig', skiprows=[0])
    for i in range(1, len(press)):
        press_csv_data = press.loc[i]
        press_title = press_csv_data['제목']
        press_date = press_csv_data['발행일']
        date_time_obj = datetime.strptime(press_date, '%Y.%m.%d')
        press_preview_url = press_csv_data['보도자료hwp링크']
        press_page_url = press_csv_data['보도자료페이지링크']
        press_keyword = press_csv_data['키워드(10개)']
        # DB에 인서트
        press_data = Press(title=press_title, date=date_time_obj, preview_url=press_preview_url, page_url=press_page_url, keyword=press_keyword)
        press_data.save()
