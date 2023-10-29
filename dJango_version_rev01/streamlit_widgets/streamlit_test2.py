
# to run streamlit app use this command line:   streamlit run streamlit_test1.py

import streamlit as st 
import yfinance as yf 
import pandas as pd

#st.title('Lit Finance Dashboard')
#tickers = ('TSLA', 'AAPL')

# dropdown = st.multiselect('Pick Stock', 'TSLA')

# start = st.date_input('Start', value = pd.to_datetime('2021-01-01'))
# end = st.date_input('End', value = pd.to_datetime('today'))


value_st = pd.to_datetime('2021-08-01')
value_end = pd.to_datetime('today')

df = yf.download('TSLA',value_st,value_end)['Adj Close']
st.line_chart(df)

# if len(dropdown)>0:
#     df = yf.download(dropdown,start,end)['Adj Close']
#     st.line_chart(df)
    
    