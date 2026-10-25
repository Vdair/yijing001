# -*- coding: utf-8 -*-
"""
生成 course-data.js 脚本
将 64 卦及易学通识、易理模型组织成由浅入深的通关课程体系
"""
import os
import re
import json

base_dir = r"c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001"
gua_dir = os.path.join(base_dir, "02_六十四卦精研档案")

# 卦象符号与二进制映射
gua_symbols = {
    "01_乾为天": {"symbol": "䷀", "upper": "乾为天", "lower": "乾为天", "lines": [1,1,1,1,1,1]},
    "02_坤为地": {"symbol": "䷁", "upper": "坤为地", "lower": "坤为地", "lines": [0,0,0,0,0,0]},
    "03_水雷屯": {"symbol": "䷂", "upper": "坎为水", "lower": "震为雷", "lines": [1,0,0,0,1,0]},
    "04_山水蒙": {"symbol": "䷃", "upper": "艮为山", "lower": "坎为水", "lines": [0,1,0,0,0,1]},
    "05_水天需": {"symbol": "䷄", "upper": "坎为水", "lower": "乾为天", "lines": [1,1,1,0,1,0]},
    "06_天水讼": {"symbol": "䷅", "upper": "乾为天", "lower": "坎为水", "lines": [0,1,0,1,1,1]},
    "07_地水师": {"symbol": "䷆", "upper": "坤为地", "lower": "坎为水", "lines": [0,1,0,0,0,0]},
    "08_水地比": {"symbol": "䷇", "upper": "坎为水", "lower": "坤为地", "lines": [0,0,0,0,1,0]},
    "09_风天小畜": {"symbol": "䷈", "upper": "巽为风", "lower": "乾为天", "lines": [1,1,1,0,1,1]},
    "10_天泽履": {"symbol": "䷉", "upper": "乾为天", "lower": "兑为泽", "lines": [1,1,0,1,1,1]},
    "11_地天泰": {"symbol": "䷊", "upper": "坤为地", "lower": "乾为天", "lines": [1,1,1,0,0,0]},
    "12_天地否": {"symbol": "䷋", "upper": "乾为天", "lower": "坤为地", "lines": [0,0,0,1,1,1]},
    "13_天火同人": {"symbol": "䷌", "upper": "乾为天", "lower": "离为火", "lines": [1,0,1,1,1,1]},
    "14_火天大有": {"symbol": "䷍", "upper": "离为火", "lower": "乾为天", "lines": [1,1,1,1,0,1]},
    "15_地山谦": {"symbol": "䷎", "upper": "坤为地", "lower": "艮为山", "lines": [0,0,1,0,0,0]},
    "16_雷地豫": {"symbol": "䷏", "upper": "震为雷", "lower": "坤为地", "lines": [0,0,0,1,0,0]},
    "17_泽雷随": {"symbol": "䷐", "upper": "兑为泽", "lower": "震为雷", "lines": [1,0,0,1,1,0]},
    "18_山风蛊": {"symbol": "䷑", "upper": "艮为山", "lower": "巽为风", "lines": [0,1,1,0,0,1]},
    "19_地泽临": {"symbol": "䷒", "upper": "坤为地", "lower": "兑为泽", "lines": [1,1,0,0,0,0]},
    "20_风地观": {"symbol": "䷓", "upper": "巽为风", "lower": "坤为地", "lines": [0,0,0,0,1,1]},
    "21_火雷噬嗑": {"symbol": "䷔", "upper": "离为火", "lower": "震为雷", "lines": [1,0,0,1,0,1]},
    "22_山火贲": {"symbol": "䷕", "upper": "艮为山", "lower": "离为火", "lines": [1,0,1,0,0,1]},
    "23_山地剥": {"symbol": "䷖", "upper": "艮为山", "lower": "坤为地", "lines": [0,0,0,0,0,1]},
    "24_地雷复": {"symbol": "䷗", "upper": "坤为地", "lower": "震为雷", "lines": [1,0,0,0,0,0]},
    "25_天雷无妄": {"symbol": "䷘", "upper": "乾为天", "lower": "震为雷", "lines": [1,0,0,1,1,1]},
    "26_山天大畜": {"symbol": "䷙", "upper": "艮为山", "lower": "乾为天", "lines": [1,1,1,0,0,1]},
    "27_山雷颐": {"symbol": "䷚", "upper": "艮为山", "lower": "震为雷", "lines": [1,0,0,0,0,1]},
    "28_泽风大过": {"symbol": "䷛", "upper": "兑为泽", "lower": "巽为风", "lines": [0,1,1,1,1,0]},
    "29_坎为水": {"symbol": "䷜", "upper": "坎为水", "lower": "坎为水", "lines": [0,1,0,0,1,0]},
    "30_离为火": {"symbol": "䷝", "upper": "离为火", "lower": "离为火", "lines": [1,0,1,1,0,1]},
    "31_泽山咸": {"symbol": "䷞", "upper": "兑为泽", "lower": "艮为山", "lines": [0,0,1,1,1,0]},
    "32_雷风恒": {"symbol": "䷟", "upper": "震为雷", "lower": "巽为风", "lines": [0,1,1,1,0,0]},
    "33_天山遁": {"symbol": "䷠", "upper": "乾为天", "lower": "艮为山", "lines": [0,0,1,1,1,1]},
    "34_雷天大壮": {"symbol": "䷡", "upper": "震为雷", "lower": "乾为天", "lines": [1,1,1,1,0,0]},
    "35_火地晋": {"symbol": "䷢", "upper": "离为火", "lower": "坤为地", "lines": [0,0,0,1,0,1]},
    "36_地火明夷": {"symbol": "䷣", "upper": "坤为地", "lower": "离为火", "lines": [1,0,1,0,0,0]},
    "37_风火家人": {"symbol": "䷤", "upper": "巽为风", "lower": "离为火", "lines": [1,0,1,0,1,1]},
    "38_火泽睽": {"symbol": "䷥", "upper": "离为火", "lower": "兑为泽", "lines": [1,1,0,1,0,1]},
    "39_水山蹇": {"symbol": "䷦", "upper": "坎为水", "lower": "艮为山", "lines": [0,0,1,0,1,0]},
    "40_雷水解": {"symbol": "䷧", "upper": "震为雷", "lower": "坎为水", "lines": [0,1,0,1,0,0]},
    "41_山泽损": {"symbol": "䷨", "upper": "艮为山", "lower": "兑为泽", "lines": [1,1,0,0,0,1]},
    "42_风雷益": {"symbol": "䷩", "upper": "巽为风", "lower": "震为雷", "lines": [1,0,0,0,1,1]},
    "43_泽天夬": {"symbol": "䷪", "upper": "兑为泽", "lower": "乾为天", "lines": [1,1,1,1,1,0]},
    "44_天风姤": {"symbol": "䷫", "upper": "乾为天", "lower": "巽为风", "lines": [0,1,1,1,1,1]},
    "45_泽地萃": {"symbol": "䷬", "upper": "兑为泽", "lower": "坤为地", "lines": [0,0,0,1,1,0]},
    "46_地风升": {"symbol": "䷭", "upper": "坤为地", "lower": "巽为风", "lines": [0,1,1,0,0,0]},
    "47_泽水困": {"symbol": "䷮", "upper": "兑为泽", "lower": "坎为水", "lines": [0,1,0,1,1,0]},
    "48_水风井": {"symbol": "䷯", "upper": "坎为水", "lower": "巽为风", "lines": [0,1,1,0,1,0]},
    "49_泽火革": {"symbol": "䷰", "upper": "兑为泽", "lower": "离为火", "lines": [1,0,1,1,1,0]},
    "50_火风鼎": {"symbol": "䷱", "upper": "离为火", "lower": "巽为风", "lines": [0,1,1,1,0,1]},
    "51_震为雷": {"symbol": "䷲", "upper": "震为雷", "lower": "震为雷", "lines": [1,0,0,1,0,0]},
    "52_艮为山": {"symbol": "䷳", "upper": "艮为山", "lower": "艮为山", "lines": [0,0,1,0,0,1]},
    "53_风山渐": {"symbol": "䷴", "upper": "巽为风", "lower": "艮为山", "lines": [0,0,1,0,1,1]},
    "54_雷泽归妹": {"symbol": "䷵", "upper": "震为雷", "lower": "兑为泽", "lines": [1,1,0,1,0,0]},
    "55_雷火丰": {"symbol": "䷶", "upper": "震为雷", "lower": "离为火", "lines": [1,0,1,1,0,0]},
    "56_火山旅": {"symbol": "䷷", "upper": "离为火", "lower": "艮为山", "lines": [0,0,1,1,0,1]},
    "57_巽为风": {"symbol": "䷸", "upper": "巽为风", "lower": "巽为风", "lines": [0,1,1,0,1,1]},
    "58_兑为泽": {"symbol": "䷹", "upper": "兑为泽", "lower": "兑为泽", "lines": [1,1,0,1,1,0]},
    "59_风水涣": {"symbol": "䷺", "upper": "巽为风", "lower": "坎为水", "lines": [0,1,0,0,1,1]},
    "60_水泽节": {"symbol": "䷻", "upper": "坎为水", "lower": "兑为泽", "lines": [1,1,0,0,1,0]},
    "61_风泽中孚": {"symbol": "䷼", "upper": "巽为风", "lower": "兑为泽", "lines": [1,1,0,0,1,1]},
    "62_雷山小过": {"symbol": "䷽", "upper": "震为雷", "lower": "艮为山", "lines": [0,0,1,1,0,0]},
    "63_水火既济": {"symbol": "䷾", "upper": "坎为水", "lower": "离为火", "lines": [1,0,1,0,1,0]},
    "64_火水未济": {"symbol": "䷿", "upper": "离为火", "lower": "坎为水", "lines": [0,1,0,1,0,1]}
}

print("Loaded gua metadata count:", len(gua_symbols))
