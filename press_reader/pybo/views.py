from django.shortcuts import render
from django.views.generic import TemplateView
from .models import *
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json


class Index(TemplateView):
    template_name = 'templates/pybo/index.html'


def index(request):
    ###########################################################################
    # 보도자료 검색해 가져오기
    try:
        searchURL = "https://www.korea.kr/news/pressReleaseView.do?newsId=156536149&pageIndex=28&repCodeType=%EB%B6%80%EC%B2%98&repCode=&startDate=2022-11-13&endDate=2022-11-19&srchWord=&period=direct"
        for x in InputURL.objects.all():
            searchURL = x.url
        pressObject = Press.objects.get(page_url=searchURL)
    except(FileExistsError):
        return render(request, 'pybo/index.html', context={"isFileExists": False})

    # 보도자료 데이터
    title = pressObject.title
    date = pressObject.getDate()        # news.date로 추후 수정 필요
    press_preview_url = pressObject.preview_url
    press_keyword = pressObject.keyword
    #press_description = pressObject.description

    # 보도자료 데이터 결과
    pressInfo = {"url": press_preview_url, "title": title, "date": date}


    ###########################################################################
    # 뉴스 데이터 검색해 가져오기
    # 키워드 3개 이상 겹치는 뉴스 골라 -> 그 뉴스만 유사도 돌려 -> 유사도 0.5 이상만 뉴스데이터 결과에 포함시킴
    relatedNewsArray = []
    for newsObject in News.objects.all():
        # 키워드 3개 이상 겹치는 뉴스 골라
        news_keyword = newsObject.keyword
        allTuples = []
        for x in list(press_keyword.split()):
            for y in list(news_keyword.split()):
                allTuples.append((x, y))
        same = [i for i, j in allTuples if i == j]
        if len(same) >= 1:
            # 유사도가 0.5 이상인 뉴스 골라
            corpus = [news_keyword, press_keyword]
            tfidf = TfidfVectorizer()
            X = tfidf.fit_transform(corpus).todense()
            similarity = cosine_similarity(X[0], X[1])[0][0]
            if similarity >= 0.25:
                # 연관뉴스로 선택 및 유사도 변경
                relatedNewsArray.append(newsObject)
                newsObject.similarity = similarity

    # 날짜순 정렬
    relatedNewsArray.sort(key=lambda x: x.getDate())

    # 중복 제거
    # temp = []
    # for x in relatedNewsArray:
    #     if x not in temp:
    #         temp.append(x)
    # relatedNewsArray = temp

    # 뉴스 데이터
    news_num = len(relatedNewsArray)
    newsTitles = []
    newsDescriptions = []
    newsUrls = []
    newsDates = []
    newsPresses = []
    newsSimilarities = []
    for newsObject in relatedNewsArray:
        newsTitles.append(newsObject.title)
        newsDescriptions.append(newsObject.description)
        newsUrls.append(newsObject.url)
        newsDates.append(newsObject.getDate())
        newsPresses.append(newsObject.news_com)
        newsSimilarities.append(newsObject.similarity)

    # 뉴스 데이터 배열 렌더링
    j_newsTitles = json.dumps(newsTitles)
    j_newsDescriptions = json.dumps(newsDescriptions)
    j_newsUrls = json.dumps(newsUrls)
    j_newsDates = json.dumps(newsDates)
    j_newsPresses = json.dumps(newsPresses)
    j_newsSimilarities = json.dumps(newsSimilarities)

    # 뉴스 데이터 결과
    newsInfo = {"news_num": news_num, "newsTitles": j_newsTitles, "newsDescriptions": j_newsDescriptions, "newsUrls": j_newsUrls, "newsDates": j_newsDates, "newsPresses": j_newsPresses, "newsSimilarities": j_newsSimilarities}

    return render(request, 'pybo/index.html', context={"isFileExists": True, "pressInfo": pressInfo, "newsInfo": newsInfo})
# Create your views here.
