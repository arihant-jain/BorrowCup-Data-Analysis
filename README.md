# BorrowCup Data Analysis
[Visit the Dashboard](https://arihant-jain.github.io/BorrowCup-Data-Analysis/index.html "BorrowCup Dashboard")

## A bit about BorrowCup
BorrowCup is a students’ initiative towards sustainable living funded by Monash University. According to a statistic, about 1 million disposable coffee cups are used across Monash University Melbourne campuses every year. This initiative aims to reduce that number by allowing students and staff to use BorrowCup – a keep cup which can be borrowed from a cafe and returned in dedicated bins spread across campus at their convenience.

## Aim:
#### Cups Usage Analysis
Number of times cups were borrowed
#### Return Time Analysis 
After how much time, cups were returned once borrowed

## Approach in brief:
#### Get Data from API Get data from the REST API

#### Clean data

Drop irrelevant information
Filter out the data before 22nd Jan 2020 (because Return data is 99% accurate post this date)
Check for duplicate rows
Map sale records to their return records and fabricate date-times if either one doesn't exist.
Get the final cleaned data
#### Analyse data

Perform Return Time Analysis
Perform Cups Usage (Number of times cups have been used/borrowed) Analysis
Note

This code analyses the data post 22nd Jan 2020.
Here, 'sale' and 'borrow' terms, and 'row' and 'record' terms have been used interchangeably.

Open the notebook in Google Colab

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/arihant-jain/BorrowCup-Data-Analysis/blob/master/notebooks/ReturnTimeHistogram.ipynb)
