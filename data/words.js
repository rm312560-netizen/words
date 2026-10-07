// 日常會話・旅遊英文單字與片語，依主題分類
// 每行格式：英文｜詞性｜中文意思｜例句｜例句翻譯
// 詞性：n. 名詞、v. 動詞、adj. 形容詞、adv. 副詞、prep. 介系詞、pron. 代名詞、phr. 片語、int. 感嘆詞
(function () {
  const RAW = {
    '打招呼與禮貌': `
hello|int.|你好|Hello, nice to meet you.|你好，很高興認識你。
goodbye|int.|再見|Goodbye, see you tomorrow.|再見，明天見。
please|adv.|請|Please sit down.|請坐。
thank|v.|感謝|Thank you for your help.|謝謝你的幫忙。
sorry|adj.|抱歉的|I'm sorry I'm late.|抱歉我遲到了。
excuse|v.|原諒；打擾|Excuse me, where is the station?|不好意思，車站在哪裡？
welcome|adj.|受歡迎的|You're welcome.|不客氣。
name|n.|名字|What's your name?|你叫什麼名字？
friend|n.|朋友|She is my best friend.|她是我最好的朋友。
nice|adj.|好的；友善的|It's nice to see you again.|很高興再見到你。
fine|adj.|好的；沒問題的|I'm fine, thanks.|我很好，謝謝。
introduce|v.|介紹|Let me introduce myself.|讓我自我介紹一下。
meet|v.|見面；認識|Where should we meet?|我們要在哪裡見面？
again|adv.|再次|Could you say that again?|你可以再說一次嗎？
understand|v.|理解|I don't understand.|我不懂。
repeat|v.|重複|Can you repeat that, please?|可以請你重複一次嗎？
slowly|adv.|慢慢地|Please speak slowly.|請說慢一點。
help|v.|幫忙|Can you help me?|你可以幫我嗎？
question|n.|問題|I have a question.|我有一個問題。
answer|n.|答案；回答|Thanks for your answer.|謝謝你的回答。
`,
    '數字與時間': `
number|n.|數字；號碼|What's your phone number?|你的電話號碼是幾號？
time|n.|時間|What time is it now?|現在幾點？
hour|n.|小時|The trip takes two hours.|這趟旅程要兩個小時。
minute|n.|分鐘|Wait a minute, please.|請稍等一下。
morning|n.|早上|I drink coffee every morning.|我每天早上喝咖啡。
afternoon|n.|下午|Let's meet in the afternoon.|我們下午見面吧。
evening|n.|傍晚；晚上|What are you doing this evening?|你今天晚上要做什麼？
night|n.|夜晚|Good night, sleep well.|晚安，好好睡。
today|n.|今天|It's sunny today.|今天天氣晴朗。
tomorrow|n.|明天|I'll call you tomorrow.|我明天打給你。
yesterday|n.|昨天|I was busy yesterday.|我昨天很忙。
week|n.|週|I go to the gym twice a week.|我一週去兩次健身房。
weekend|n.|週末|Have a nice weekend!|週末愉快！
month|n.|月|I'm going to Japan next month.|我下個月要去日本。
year|n.|年|I started learning English this year.|我今年開始學英文。
early|adj.|早的|I need to get up early.|我需要早起。
late|adj.|晚的；遲的|Sorry, the bus was late.|抱歉，公車誤點了。
now|adv.|現在|I'm busy right now.|我現在很忙。
soon|adv.|很快；不久|See you soon.|待會見。
later|adv.|稍後|I'll do it later.|我晚點再做。
before|prep.|在…之前|Wash your hands before dinner.|晚餐前要洗手。
after|prep.|在…之後|Let's go for a walk after lunch.|午餐後去散步吧。
date|n.|日期；約會|What's the date today?|今天幾月幾號？
birthday|n.|生日|Happy birthday!|生日快樂！
half|n.|一半|I'll be there in half an hour.|我半小時後到。
`,
    '人與家人': `
family|n.|家人；家庭|I live with my family.|我和家人住在一起。
parent|n.|父母親之一|My parents live in Taipei.|我爸媽住在台北。
father|n.|爸爸|My father is a teacher.|我爸爸是老師。
mother|n.|媽媽|My mother cooks very well.|我媽媽很會做菜。
brother|n.|兄弟|I have one older brother.|我有一個哥哥。
sister|n.|姊妹|My sister lives in Canada.|我姊姊住在加拿大。
child|n.|小孩|The child is playing in the park.|那個小孩在公園玩。
husband|n.|丈夫|Her husband is very kind.|她先生人很好。
wife|n.|妻子|This is my wife, Amy.|這是我太太艾咪。
people|n.|人們|There are many people here.|這裡人很多。
man|n.|男人|Who is that man?|那個男人是誰？
woman|n.|女人|The woman at the desk can help you.|櫃台那位女士可以幫你。
neighbor|n.|鄰居|Our neighbor has a big dog.|我們鄰居養了一隻大狗。
guest|n.|客人|We have guests tonight.|我們今晚有客人。
boss|n.|老闆；上司|My boss is on vacation.|我的老闆在休假。
coworker|n.|同事|I had lunch with my coworkers.|我和同事一起吃午餐。
`,
    '食物與餐廳': `
food|n.|食物|The food here is delicious.|這裡的食物很好吃。
breakfast|n.|早餐|What did you have for breakfast?|你早餐吃了什麼？
lunch|n.|午餐|Let's have lunch together.|一起吃午餐吧。
dinner|n.|晚餐|Dinner is ready.|晚餐準備好了。
restaurant|n.|餐廳|Do you know a good restaurant nearby?|你知道附近有好餐廳嗎？
menu|n.|菜單|Can I see the menu, please?|可以給我看菜單嗎？
order|v.|點餐；訂購|Are you ready to order?|您準備好點餐了嗎？
table|n.|桌子|A table for two, please.|請給我兩人桌。
reservation|n.|預約|I have a reservation at seven.|我有預約七點。
water|n.|水|Can I have some water?|可以給我一些水嗎？
coffee|n.|咖啡|I'd like a cup of coffee.|我想要一杯咖啡。
tea|n.|茶|Would you like some tea?|你要喝點茶嗎？
juice|n.|果汁|Orange juice, please.|請給我柳橙汁。
beer|n.|啤酒|Two beers, please.|請給我兩杯啤酒。
bread|n.|麵包|This bread is still warm.|這個麵包還是溫的。
rice|n.|米飯|I'd like some rice with it.|我想配一點白飯。
noodle|n.|麵|This noodle soup is spicy.|這碗湯麵很辣。
meat|n.|肉|I don't eat meat.|我不吃肉。
chicken|n.|雞肉|I'll have the fried chicken.|我要炸雞。
beef|n.|牛肉|How would you like your beef?|你的牛肉要幾分熟？
fish|n.|魚|The fish is very fresh.|這魚很新鮮。
vegetable|n.|蔬菜|Eat more vegetables.|多吃點蔬菜。
fruit|n.|水果|I eat fruit every day.|我每天吃水果。
dessert|n.|甜點|Do you have room for dessert?|你還吃得下甜點嗎？
delicious|adj.|美味的|This cake is delicious!|這個蛋糕好好吃！
spicy|adj.|辣的|Is this dish spicy?|這道菜會辣嗎？
sweet|adj.|甜的|This tea is too sweet.|這杯茶太甜了。
hungry|adj.|餓的|I'm so hungry.|我好餓。
thirsty|adj.|口渴的|Are you thirsty?|你口渴嗎？
bill|n.|帳單|Could we have the bill, please?|可以給我們帳單嗎？
tip|n.|小費|Is the tip included?|有含小費嗎？
takeout|n.|外帶|Is this for here or takeout?|內用還是外帶？
`,
    '購物': `
shop|n.|商店|This shop opens at ten.|這家店十點開門。
store|n.|商店|Is there a convenience store nearby?|附近有便利商店嗎？
market|n.|市場|Let's go to the night market.|我們去逛夜市吧。
buy|v.|買|I want to buy a souvenir.|我想買紀念品。
sell|v.|賣|Do you sell phone chargers?|你們有賣手機充電器嗎？
price|n.|價格|What's the price of this bag?|這個包包多少錢？
cheap|adj.|便宜的|This shirt is really cheap.|這件襯衫真便宜。
expensive|adj.|貴的|It's too expensive for me.|這對我來說太貴了。
discount|n.|折扣|Is there a discount on this?|這個有打折嗎？
size|n.|尺寸|Do you have this in a larger size?|這個有大一點的尺寸嗎？
color|n.|顏色|Do you have it in another color?|這個有別的顏色嗎？
try|v.|嘗試；試穿|Can I try this on?|我可以試穿嗎？
cash|n.|現金|Do you accept cash?|你們收現金嗎？
card|n.|卡片；信用卡|Can I pay by card?|我可以刷卡嗎？
change|n.|零錢；找的錢|Here's your change.|這是找您的錢。
receipt|n.|收據|Can I have a receipt?|可以給我收據嗎？
bag|n.|袋子；包包|Do you need a bag?|您需要袋子嗎？
souvenir|n.|紀念品|I bought souvenirs for my friends.|我幫朋友買了紀念品。
gift|n.|禮物|It's a gift for my mother.|這是要給我媽媽的禮物。
refund|n.|退款|Can I get a refund?|我可以退款嗎？
open|adj.|開著的；營業中的|Is the shop open on Sunday?|這家店星期日有開嗎？
closed|adj.|關閉的；打烊的|Sorry, we're closed.|抱歉，我們打烊了。
`,
    '交通與方向': `
station|n.|車站|How do I get to the train station?|火車站要怎麼去？
train|n.|火車|The train leaves at nine.|火車九點出發。
bus|n.|公車|Which bus goes downtown?|哪一班公車到市中心？
subway|n.|地鐵|The subway is faster.|搭地鐵比較快。
taxi|n.|計程車|Let's take a taxi.|我們搭計程車吧。
ticket|n.|票|One ticket to London, please.|請給我一張去倫敦的票。
stop|n.|站牌；停靠站|Get off at the next stop.|在下一站下車。
platform|n.|月台|The train is on platform three.|火車在第三月台。
transfer|v.|轉乘|You need to transfer at Central Station.|你要在中央車站轉車。
map|n.|地圖|Can you show me on the map?|你可以在地圖上指給我看嗎？
street|n.|街道|The hotel is on this street.|飯店就在這條街上。
corner|n.|轉角|Turn left at the corner.|在轉角左轉。
left|n.|左邊|The bank is on your left.|銀行在你的左手邊。
right|n.|右邊|Turn right at the traffic light.|在紅綠燈右轉。
straight|adv.|直直地|Go straight for two blocks.|直走兩個路口。
near|prep.|在…附近|Is there an ATM near here?|這附近有提款機嗎？
far|adj.|遠的|Is it far from here?|離這裡很遠嗎？
across|prep.|在對面|The cafe is across the street.|咖啡店在對街。
between|prep.|在…之間|The shop is between the bank and the post office.|那家店在銀行和郵局之間。
lost|adj.|迷路的|Excuse me, I think I'm lost.|不好意思，我好像迷路了。
way|n.|路；方法|Is this the right way to the museum?|這是去博物館的路嗎？
walk|v.|走路|It's a ten-minute walk.|走路十分鐘。
drive|v.|開車|Can you drive me to the airport?|你可以載我去機場嗎？
traffic|n.|交通；車流|The traffic is heavy today.|今天交通很塞。
`,
    '機場與飯店': `
airport|n.|機場|How long does it take to get to the airport?|到機場要多久？
flight|n.|航班|My flight is delayed.|我的班機延誤了。
passport|n.|護照|May I see your passport?|可以看一下您的護照嗎？
boarding|n.|登機|Boarding starts at 8:30.|八點半開始登機。
gate|n.|登機門|Which gate is it?|是哪個登機門？
seat|n.|座位|Can I have a window seat?|我可以要靠窗的座位嗎？
luggage|n.|行李|Where can I pick up my luggage?|我要在哪裡領行李？
suitcase|n.|行李箱|My suitcase is too heavy.|我的行李箱太重了。
check in|phr.|報到；辦理入住|I'd like to check in, please.|我要辦理入住。
check out|phr.|退房|We need to check out by eleven.|我們要在十一點前退房。
hotel|n.|飯店|I'm staying at a hotel downtown.|我住在市中心的飯店。
room|n.|房間|Do you have a room for tonight?|今晚還有房間嗎？
key|n.|鑰匙|I lost my room key.|我把房間鑰匙弄丟了。
floor|n.|樓層|Your room is on the fifth floor.|您的房間在五樓。
elevator|n.|電梯|Where is the elevator?|電梯在哪裡？
towel|n.|毛巾|Could I get some more towels?|可以多給我幾條毛巾嗎？
wifi|n.|無線網路|What's the wifi password?|無線網路密碼是什麼？
breakfast included|phr.|含早餐|Is breakfast included?|有含早餐嗎？
customs|n.|海關|We went through customs quickly.|我們很快就通過海關了。
delay|n.|延誤|Sorry for the delay.|抱歉延誤了。
cancel|v.|取消|My flight was canceled.|我的班機被取消了。
book|v.|預訂|I booked a room for three nights.|我訂了三晚的房間。
`,
    '旅遊與景點': `
travel|v.|旅行|I love to travel.|我很喜歡旅行。
trip|n.|旅程|How was your trip?|你的旅行怎麼樣？
tour|n.|觀光；導覽|Is there a city tour?|有市區導覽嗎？
museum|n.|博物館|The museum is closed on Mondays.|博物館星期一休館。
beach|n.|海灘|Let's go to the beach.|我們去海邊吧。
mountain|n.|山|We climbed the mountain yesterday.|我們昨天去爬山。
park|n.|公園|There's a big park near my hotel.|我的飯店附近有一座大公園。
temple|n.|寺廟|This temple is very old.|這座寺廟很古老。
view|n.|景色|The view from here is amazing.|從這裡看出去的景色很棒。
photo|n.|照片|Could you take a photo of us?|可以幫我們拍張照嗎？
famous|adj.|有名的|This place is famous for its food.|這個地方以美食聞名。
popular|adj.|受歡迎的|This restaurant is very popular.|這家餐廳很受歡迎。
crowded|adj.|擁擠的|The train was crowded.|火車很擠。
beautiful|adj.|美麗的|What a beautiful day!|真是美好的一天！
visit|v.|拜訪；參觀|I want to visit Paris someday.|我希望有一天能去巴黎。
plan|n.|計畫|What's the plan for today?|今天的計畫是什麼？
vacation|n.|假期|I'm on vacation this week.|我這週在休假。
guide|n.|導遊；指南|Our guide speaks Chinese.|我們的導遊會說中文。
entrance|n.|入口|Where is the entrance?|入口在哪裡？
exit|n.|出口|Take exit four.|走四號出口。
`,
    '日常生活': `
home|n.|家|I'm going home now.|我現在要回家。
house|n.|房子|They live in a big house.|他們住在一間大房子裡。
apartment|n.|公寓|My apartment is small but cozy.|我的公寓很小但很舒適。
kitchen|n.|廚房|She is cooking in the kitchen.|她在廚房煮飯。
bathroom|n.|浴室；廁所|Where is the bathroom?|廁所在哪裡？
bed|n.|床|I went to bed early last night.|我昨晚很早就睡了。
phone|n.|電話；手機|My phone is out of battery.|我的手機沒電了。
computer|n.|電腦|I use my computer every day.|我每天都用電腦。
money|n.|錢|I need to save money.|我需要存錢。
work|n.|工作|I have a lot of work today.|我今天工作很多。
job|n.|工作；職業|I like my new job.|我喜歡我的新工作。
office|n.|辦公室|I'll be at the office until six.|我六點前都在辦公室。
meeting|n.|會議|I have a meeting at two.|我兩點有會議。
email|n.|電子郵件|I'll send you an email.|我會寄電子郵件給你。
weather|n.|天氣|How's the weather today?|今天天氣如何？
music|n.|音樂|What kind of music do you like?|你喜歡哪種音樂？
movie|n.|電影|Let's watch a movie tonight.|今晚來看電影吧。
book|n.|書|I'm reading a good book.|我正在讀一本好書。
sport|n.|運動|What's your favorite sport?|你最喜歡什麼運動？
hobby|n.|嗜好|My hobby is cooking.|我的嗜好是煮飯。
weekend plans|phr.|週末計畫|Do you have any weekend plans?|你週末有什麼計畫嗎？
clothes|n.|衣服|I need to wash my clothes.|我需要洗衣服。
umbrella|n.|雨傘|Don't forget your umbrella.|別忘了帶傘。
wallet|n.|錢包|I left my wallet at home.|我把錢包忘在家裡了。
`,
    '身體與健康': `
body|n.|身體|Exercise is good for your body.|運動對身體好。
head|n.|頭|My head hurts a little.|我的頭有點痛。
eye|n.|眼睛|My eyes are tired.|我的眼睛很累。
hand|n.|手|Wash your hands.|洗洗手。
foot|n.|腳|My feet hurt after the long walk.|走了很久之後我的腳好痛。
stomach|n.|胃；肚子|My stomach hurts.|我肚子痛。
sick|adj.|生病的|I feel sick today.|我今天覺得不舒服。
cold|n.|感冒|I caught a cold.|我感冒了。
fever|n.|發燒|She has a high fever.|她發高燒。
medicine|n.|藥|Take this medicine after meals.|飯後吃這個藥。
doctor|n.|醫生|You should see a doctor.|你應該去看醫生。
hospital|n.|醫院|Where is the nearest hospital?|最近的醫院在哪裡？
pharmacy|n.|藥局|Is there a pharmacy around here?|這附近有藥局嗎？
hurt|v.|疼痛；受傷|My back hurts.|我的背好痛。
tired|adj.|累的|I'm so tired today.|我今天好累。
healthy|adj.|健康的|Eat healthy food.|吃健康的食物。
exercise|v.|運動|I exercise three times a week.|我一週運動三次。
sleep|v.|睡覺|Did you sleep well?|你睡得好嗎？
allergic|adj.|過敏的|I'm allergic to peanuts.|我對花生過敏。
emergency|n.|緊急情況|Call 911 in an emergency.|緊急時打 911。
`,
    '天氣與季節': `
sunny|adj.|晴朗的|It's sunny and warm today.|今天晴朗又溫暖。
rainy|adj.|下雨的|It's a rainy day.|今天是下雨天。
cloudy|adj.|多雲的|It's cloudy this morning.|今天早上多雲。
windy|adj.|颳風的|It's very windy outside.|外面風很大。
hot|adj.|熱的|It's too hot to go out.|太熱了不想出門。
cold|adj.|冷的|It's cold in winter.|冬天很冷。
warm|adj.|溫暖的|The weather is warm in spring.|春天天氣溫暖。
cool|adj.|涼爽的|It's cool in the evening.|晚上很涼爽。
rain|n.|雨|It's going to rain later.|等一下會下雨。
snow|n.|雪|Have you ever seen snow?|你看過雪嗎？
spring|n.|春天|Cherry blossoms bloom in spring.|櫻花在春天盛開。
summer|n.|夏天|Summer is my favorite season.|夏天是我最喜歡的季節。
fall|n.|秋天|The leaves turn red in fall.|秋天葉子會變紅。
winter|n.|冬天|Winter here is mild.|這裡的冬天很溫和。
season|n.|季節|Which season do you like best?|你最喜歡哪個季節？
temperature|n.|溫度|The temperature dropped tonight.|今晚氣溫下降了。
`,
    '常用動詞': `
go|v.|去|Where are you going?|你要去哪裡？
come|v.|來|Can you come to my party?|你可以來我的派對嗎？
get|v.|得到；到達|How do I get there?|我要怎麼去那裡？
take|v.|拿；搭乘；花費|It takes ten minutes by bus.|搭公車要十分鐘。
make|v.|做；製作|I'll make some coffee.|我來泡點咖啡。
have|v.|有；吃|I have two tickets.|我有兩張票。
want|v.|想要|I want to go home.|我想回家。
need|v.|需要|I need some help.|我需要一些幫忙。
like|v.|喜歡|I like this song.|我喜歡這首歌。
know|v.|知道|Do you know where it is?|你知道它在哪裡嗎？
think|v.|想；認為|I think it's a good idea.|我覺得這是個好主意。
see|v.|看見|I can't see anything.|我什麼都看不到。
look|v.|看|Look at that building!|看那棟建築！
hear|v.|聽見|Can you hear me?|你聽得到我嗎？
listen|v.|聽|Listen to me carefully.|仔細聽我說。
speak|v.|說（語言）|Do you speak English?|你會說英文嗎？
say|v.|說|What did you say?|你剛剛說什麼？
tell|v.|告訴|Can you tell me the way?|你可以告訴我怎麼走嗎？
ask|v.|問；要求|Can I ask you something?|我可以問你一件事嗎？
eat|v.|吃|Let's eat something.|我們吃點東西吧。
drink|v.|喝|What would you like to drink?|你想喝什麼？
pay|v.|付錢|I'll pay for dinner.|晚餐我請客。
find|v.|找到|I can't find my wallet.|我找不到我的錢包。
give|v.|給|Can you give me a hand?|你可以幫我一下嗎？
bring|v.|帶來|Please bring your passport.|請帶護照。
use|v.|使用|Can I use your phone?|我可以借用你的手機嗎？
wait|v.|等待|Please wait here.|請在這裡等。
stay|v.|停留；住宿|How long will you stay?|你會待多久？
leave|v.|離開|What time do you leave?|你幾點離開？
arrive|v.|抵達|We arrived at the hotel late.|我們很晚才到飯店。
return|v.|返回；歸還|I need to return this book.|我需要還這本書。
send|v.|寄；傳送|I'll send you the photos.|我會把照片傳給你。
call|v.|打電話；稱呼|I'll call you later.|我晚點打給你。
learn|v.|學習|I'm learning English.|我正在學英文。
remember|v.|記得|I don't remember his name.|我不記得他的名字。
forget|v.|忘記|Don't forget to call me.|別忘了打給我。
start|v.|開始|The movie starts at eight.|電影八點開始。
finish|v.|完成|I finished my work.|我完成工作了。
open|v.|打開|Can you open the window?|你可以打開窗戶嗎？
close|v.|關上|Please close the door.|請關門。
`,
    '常用形容詞': `
good|adj.|好的|That's a good idea.|那是個好主意。
bad|adj.|壞的；不好的|The weather is bad today.|今天天氣不好。
big|adj.|大的|This room is very big.|這個房間很大。
small|adj.|小的|The shop is small but nice.|這家店小小的但很不錯。
new|adj.|新的|I bought a new phone.|我買了新手機。
old|adj.|舊的；老的|This is an old building.|這是一棟老建築。
happy|adj.|快樂的|I'm happy to see you.|我很高興見到你。
sad|adj.|難過的|Why are you sad?|你為什麼難過？
busy|adj.|忙碌的|I'm busy this week.|我這週很忙。
free|adj.|空閒的；免費的|Are you free tonight?|你今晚有空嗎？
easy|adj.|簡單的|This question is easy.|這題很簡單。
difficult|adj.|困難的|English grammar is difficult.|英文文法很難。
important|adj.|重要的|This meeting is important.|這個會議很重要。
interesting|adj.|有趣的|That's an interesting story.|那是個有趣的故事。
boring|adj.|無聊的|The movie was boring.|那部電影很無聊。
quiet|adj.|安靜的|This cafe is quiet.|這家咖啡店很安靜。
noisy|adj.|吵鬧的|The street is noisy at night.|那條街晚上很吵。
clean|adj.|乾淨的|The room is very clean.|房間很乾淨。
dirty|adj.|髒的|My shoes are dirty.|我的鞋子髒了。
fast|adj.|快的|The train is very fast.|這班火車很快。
slow|adj.|慢的|The internet is slow today.|今天網路很慢。
safe|adj.|安全的|Is this area safe at night?|這一區晚上安全嗎？
dangerous|adj.|危險的|It's dangerous to swim here.|在這裡游泳很危險。
convenient|adj.|方便的|The location is very convenient.|這個地點很方便。
comfortable|adj.|舒服的|These shoes are comfortable.|這雙鞋很舒服。
ready|adj.|準備好的|Are you ready?|你準備好了嗎？
sure|adj.|確定的|Are you sure?|你確定嗎？
full|adj.|飽的；滿的|I'm full, thank you.|我吃飽了，謝謝。
available|adj.|有空的；可用的|Is this seat available?|這個位子有人坐嗎？
different|adj.|不同的|This one is different.|這個不一樣。
same|adj.|相同的|We have the same phone.|我們的手機一樣。
`,
    '副詞與疑問詞': `
what|pron.|什麼|What do you want?|你想要什麼？
where|adv.|哪裡|Where are you from?|你從哪裡來？
when|adv.|什麼時候|When does it open?|它什麼時候開？
why|adv.|為什麼|Why are you late?|你為什麼遲到？
who|pron.|誰|Who is your teacher?|你的老師是誰？
which|pron.|哪一個|Which one do you like?|你喜歡哪一個？
how|adv.|如何|How do you say this in English?|這個用英文怎麼說？
how much|phr.|多少錢|How much is this?|這個多少錢？
how long|phr.|多久|How long does it take?|要花多久時間？
very|adv.|非常|It's very cold today.|今天非常冷。
really|adv.|真的|I really like it.|我真的很喜歡。
also|adv.|也|I also want one.|我也想要一個。
too|adv.|太；也|It's too expensive.|太貴了。
only|adv.|只有|I only have ten dollars.|我只有十塊錢。
always|adv.|總是|She is always on time.|她總是很準時。
usually|adv.|通常|I usually walk to work.|我通常走路上班。
sometimes|adv.|有時候|Sometimes I cook at home.|有時候我在家煮飯。
never|adv.|從不|I never drink coffee at night.|我晚上從不喝咖啡。
already|adv.|已經|I already ate.|我已經吃過了。
still|adv.|仍然|Are you still there?|你還在嗎？
maybe|adv.|也許|Maybe next time.|也許下次吧。
together|adv.|一起|Let's go together.|我們一起去吧。
`,
    '感覺與意見': `
feel|v.|感覺|How do you feel today?|你今天感覺怎麼樣？
glad|adj.|高興的|I'm glad you came.|很高興你來了。
excited|adj.|興奮的|I'm so excited about the trip.|我對這趟旅行好興奮。
worried|adj.|擔心的|Don't be worried.|別擔心。
nervous|adj.|緊張的|I'm nervous about the interview.|我對面試很緊張。
angry|adj.|生氣的|Are you angry with me?|你在生我的氣嗎？
surprised|adj.|驚訝的|I was surprised to see him.|看到他我很驚訝。
bored|adj.|無聊的；厭煩的|I'm bored. Let's go out.|我好無聊，我們出去吧。
favorite|adj.|最喜歡的|What's your favorite food?|你最喜歡的食物是什麼？
agree|v.|同意|I agree with you.|我同意你的看法。
idea|n.|主意；想法|Do you have any ideas?|你有什麼想法嗎？
opinion|n.|意見|What's your opinion?|你的意見是什麼？
hope|v.|希望|I hope you enjoy your stay.|希望你住得愉快。
worry|v.|擔心|Don't worry about it.|別擔心這件事。
prefer|v.|比較喜歡|I prefer tea to coffee.|比起咖啡我比較喜歡茶。
enjoy|v.|享受；喜歡|Did you enjoy the movie?|你喜歡那部電影嗎？
`,
    '常用片語': `
have a seat|phr.|請坐|Please have a seat over there.|請坐那邊。
take a picture|phr.|拍照|Can I take a picture here?|我可以在這裡拍照嗎？
make a reservation|phr.|預約；訂位|I'd like to make a reservation for tonight.|我想訂今晚的位子。
get lost|phr.|迷路|I always get lost in big cities.|我在大城市總是迷路。
go shopping|phr.|去購物|Let's go shopping this afternoon.|我們今天下午去購物吧。
have a good time|phr.|玩得愉快|Have a good time at the party!|派對玩得愉快！
take your time|phr.|慢慢來|Take your time, there's no rush.|慢慢來，不用急。
in front of|phr.|在…前面|I'll wait in front of the station.|我會在車站前面等。
next to|phr.|在…旁邊|The bank is next to the hotel.|銀行在飯店旁邊。
a little bit|phr.|一點點|I speak a little bit of English.|我會說一點點英文。
right now|phr.|現在；馬上|I'm on my way right now.|我現在就在路上了。
on my way|phr.|在路上|I'm on my way home.|我正在回家的路上。
come back|phr.|回來|When will you come back?|你什麼時候回來？
look for|phr.|尋找|I'm looking for the bus stop.|我在找公車站。
wait for|phr.|等待（某人或某物）|We're waiting for a taxi.|我們在等計程車。
go out|phr.|出門；外出|Do you want to go out tonight?|你今晚想出去嗎？
get up|phr.|起床|I get up at seven every day.|我每天七點起床。
sit down|phr.|坐下|Please sit down and relax.|請坐下放輕鬆。
not at all|phr.|一點也不；不客氣|Thanks! — Not at all.|謝謝！——不客氣。
that's too bad|phr.|真可惜|That's too bad. Maybe next time.|真可惜，也許下次吧。
look forward to|phr.|期待|I look forward to seeing you.|我很期待見到你。
take care of|phr.|照顧|Take care of yourself.|好好照顧自己。
pick up|phr.|接（人）；拿起|Can you pick me up at the station?|你可以到車站接我嗎？
get on|phr.|上（車）|Get on the bus here.|在這裡上公車。
get off|phr.|下（車）|Get off at the third stop.|在第三站下車。
find out|phr.|查明；發現|I'll find out and let you know.|我查清楚再告訴你。
fill out|phr.|填寫（表格）|Please fill out this form.|請填寫這張表格。
turn on|phr.|打開（電器）|Can you turn on the light?|你可以開燈嗎？
turn off|phr.|關掉（電器）|Turn off your phone, please.|請關掉手機。
put on|phr.|穿上|Put on your jacket. It's cold.|穿上外套，很冷。
take off|phr.|脫下；起飛|The plane will take off soon.|飛機快起飛了。
hurry up|phr.|快一點|Hurry up, we're late!|快點，我們遲到了！
calm down|phr.|冷靜下來|Calm down, it's okay.|冷靜，沒事的。
give up|phr.|放棄|Don't give up!|不要放棄！
show up|phr.|出現；到場|He didn't show up today.|他今天沒有出現。
run out of|phr.|用完|We ran out of milk.|我們的牛奶喝完了。
make sure|phr.|確認；確保|Make sure you have your passport.|確認你有帶護照。
by the way|phr.|順便一提|By the way, where are you from?|順便問一下，你是哪裡人？
of course|phr.|當然|Of course you can.|你當然可以。
no problem|phr.|沒問題|No problem, I can help.|沒問題，我可以幫忙。
what's up|phr.|最近怎麼樣；怎麼了|Hey, what's up?|嘿，最近怎麼樣？
I'm not sure|phr.|我不確定|I'm not sure what time it starts.|我不確定幾點開始。
it depends|phr.|看情況|It depends on the weather.|要看天氣而定。
in a hurry|phr.|趕時間|Sorry, I'm in a hurry.|抱歉，我在趕時間。
on time|phr.|準時|The train arrived on time.|火車準時抵達。
for here or to go|phr.|內用還是外帶|Is that for here or to go?|內用還是外帶？
could you|phr.|可以請你…嗎|Could you help me with this?|可以請你幫我處理這個嗎？
I'd like|phr.|我想要|I'd like a cup of tea.|我想要一杯茶。
how about|phr.|…如何|How about Italian food tonight?|今晚吃義大利菜如何？
see you|phr.|再見|See you next week!|下週見！
`,
  };

  const words = [];
  let id = 1;
  for (const [category, text] of Object.entries(RAW)) {
    for (const line of text.trim().split('\n')) {
      const [word, pos, meaning, exEn, exZh] = line.split('|').map(s => (s || '').trim());
      if (!word || !meaning) continue;
      words.push({ id: id++, word, pos, meaning, exEn, exZh, category, phrase: pos === 'phr.' });
    }
  }
  window.WORDS = words;
  window.WORD_CATEGORIES = Object.keys(RAW);
})();
