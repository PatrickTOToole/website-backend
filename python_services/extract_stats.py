import pandas as pd, requests, numpy, lxml, html5lib, re, matplotlib.pyplot as plt
from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
from pandas import DataFrame as df
from datetime import datetime, timedelta
from sqlalchemy import create_engine

def getData(player_name):
    #Request page data from SPlancke
    hdr = {'User-Agent':'Safari/13.1'}
    req = Request(f"https://www.plancke.io/hypixel/player/stats/{player_name}", headers=hdr)#Open the request into a readable format
    content = urlopen(req)
    #Run BeautifulSoup so content is more legible
    raw_content = BeautifulSoup(content)
    #Grab the table from the page and store in variable
    cleaned_content = pd.read_html(io = raw_content.prettify())[2]
    data = df(cleaned_content)
    data.columns = ["mode","kills","deaths","kd","final_Kills","final_deaths","fkd","wins","losses","win_loss","beds"]
    length = len(data)
    dropped = []
    for i in range(4,length):
        dropped.append(i)
    data = data.drop(dropped)
    now = datetime.now()
    date_str = now.strftime("%m-%d-%Y")
    date_col = []
    username_col = []
    for i in range(4):
        date_col.append(date_str)
        username_col.append(player_name)
    data['date'] = date_col
    data['username'] = username_col
    sums = data.sum(0)
    kills = sums[1] * 1.0
    deaths = sums[2] * 1.0
    kd = round(kills / deaths, 3)
    fkills = sums[4] * 1.0
    fdeaths = sums[5] * 1.0
    fkd = round(fkills / fdeaths, 3)
    wins = float(sums[7])
    losses = float(sums[8])
    win_loss = round(wins / losses,3)
    beds = sums[10]
    date_entry = data['date'][0]
    username = data['username'][0]
    d = {'username':[username],
        'final_kills':[fkills],
        'final_deaths':[fdeaths],
        'fkd':[fkd],
        'beds':[beds],
        'wins':[wins],
        'losses':[losses],
        'win_loss':[win_loss],
        'date': [date_entry],
        'kills':[kills],
        'deaths':[deaths],
        'kd':[kd]}
    final_entry = df(data=d)
    engine = create_engine('postgresql://postgres:temp@localhost:5432/website_database')
    final_entry.to_sql(name='bwars_data', con=engine, if_exists='append', index=False)
    print(f"Success for: {player_name}")
    return ""
getData("Laxcrosse")
getData("APositivePegasus")
getData("NeutrualNue")
getData("Callen")

