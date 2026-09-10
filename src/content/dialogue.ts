import type { CharacterId, DialogueNode, Line } from "./types";

const n = (speaker: CharacterId, text: string): Line => ({ speaker, text });

const nodes: DialogueNode[] = [];
function add(node: DialogueNode) {
  nodes.push(node);
  return node.id;
}

function chain(id: string, lines: Line[], next?: string, extra?: Partial<DialogueNode>) {
  add({ id, lines, next, ...extra });
}

/* ---------- intro ---------- */
chain("intro-1", [
  n("narrator", "Ты просто хотела посмотреть, кто опять орёт в «Спойлерной»."),
  n("narrator", "Стикер. Потом — потолок. Потом — чужой диван, который знает форму твоей спины."),
  n("nastya", "…это не моя квартира."),
], "intro-2");
chain("intro-2", [
  n("narrator", "Дом маленький. Людей слишком много. Где-то спорят про аниме, где-то смеются как в цирке."),
  n("narrator", "Дверь есть. Она ведёт сюда же."),
  n("kuvanov", "О. Новая. Я ж говорил, что заявка пройдёт."),
], "intro-3");
add({
  id: "intro-3",
  lines: [
    n("nastya", "Куванов? Ты что, меня украл?"),
    n("kuvanov", "Админ не крадёт. Админ добавляет. Ходи, смотри. Только Флаттершай на холодильнике не трогай."),
    n("narrator", "WASD — ходить. E или касание — говорить. J — журнал. Они все здесь. И никто не выглядит так, будто это странно."),
  ],
  effects: [{ type: "flag", key: "met:kuvanov" }, { type: "trust", id: "kuvanov", delta: 1 }],
});

/* ---------- door / sofa / tv / pc / window ---------- */
add({
  id: "door",
  lines: [n("narrator", "Дверь холодная, как экран в три ночи.")],
  choices: [
    { text: "Открыть", next: "door-try" },
    { text: "Отойти", next: "door-leave" },
  ],
});
add({
  id: "door-try",
  lines: [n("narrator", "За дверью — эта же гостиная. Тот же диван. Ты, со спины, ещё не обернулась.")],
  choices: [
    { text: "Это suffocation", next: "door-night", hideIf: ["phase:arrival"] },
    { text: "Закрыть. Не сейчас", next: "door-leave" },
    { text: "Выйти навсегда", next: "door-ending", require: ["can-leave"] },
  ],
});
chain("door-leave", [n("nastya", "Не сегодня.")]);
chain("door-night", [
  n("house", "Выход — это когда вас станет меньше на одного. Или на всех."),
  n("nastya", "Я не буду выбирать, кого выкинуть."),
]);
add({
  id: "door-ending",
  lines: [n("narrator", "Ты кладёшь ладонь на ручку. Дом не спорит. Он устал.")],
  effects: [{ type: "ending", id: "dawn" }],
});

add({
  id: "sofa",
  lines: [n("narrator", "Диван помнит всех, кто здесь «просто на пять минут».")],
  choices: [
    { text: "Сесть и перевести дух", next: "sofa-rest" },
    { text: "Попытаться уснуть", next: "sofa-sleep" },
    { text: "Оставить", next: "sofa-no" },
  ],
});
chain("sofa-rest", [n("nastya", "Ладно. Хотя бы сидеть можно."), n("ilya", "«Ладно. Хотя бы сидеть можно», — как сказала Настя.")]);
add({
  id: "sofa-sleep",
  lines: [n("narrator", "Сон в этом доме — не отдых. Это перемотка.")],
  choices: [
    { text: "Всё равно закрыть глаза", next: "sofa-advance" },
    { text: "Не надо", next: "sofa-no" },
  ],
});
chain("sofa-no", [n("nastya", "Ещё рано.")]);
add({
  id: "sofa-advance",
  lines: [n("narrator", "Когда открываешь глаза, свет другой. Часы нет. Люди те же, только громче молчат.")],
  effects: [{ type: "flag", key: "slept" }],
});

add({
  id: "tv",
  lines: [
    n("narrator", "На экране — вечный клип: турнир, пони, Сайтама бьёт воздух, потом Лелуш, потом Эл. Всё сразу."),
    n("abiyukov", "Нормальный микс. Не переключай, я калибрую."),
  ],
});
add({
  id: "pc",
  lines: [
    n("evgeniy", "Не трогай. Там модель. Она считает, когда у меня ослепнут глаза."),
    n("nastya", "Евгений."),
    n("evgeniy", "Шутка. Наверное. 2027 всё другое будет. Какой у тебя жим?"),
  ],
});
add({
  id: "window",
  lines: [
    n("narrator", "За стеклом не двор. Лента. Сообщения падают как снег: «сайтама соло», «админ не прав», «Бекболат опять»."),
    n("house", "Вы все уже прочитаны."),
  ],
});

/* ---------- items ---------- */
chain("item-sticky-admin", [
  n("narrator", "Жёлтый стикер, почерк Куванова: «не кикать Настю. она ещё не поняла». Ниже, мельче: «если кикну — останусь один»."),
], undefined, { effects: [{ type: "item", id: "sticky-admin" }, { type: "flag", key: "secret:kuvanov" }] });

chain("item-bracket", [
  n("narrator", "Сетка сильнейших. Наруто, Луффи, Сайтама, Гоку, Лелуш. Внизу карандашом: «Настя — ??? / я — не в топе»."),
], undefined, { effects: [{ type: "item", id: "bracket" }, { type: "flag", key: "secret:aldiyar" }] });

chain("item-romcom", [
  n("narrator", "Список ромкомов. Пометки: «плакать можно». Одно название подчёркнуто трижды — и рядом: «если бы я умел так, а не как в чате»."),
], undefined, { effects: [{ type: "item", id: "romcom-list" }, { type: "flag", key: "secret:abiyukov" }] });

chain("item-saitama", [
  n("narrator", "Тетрадь. Формулы силы, таблицы, стрелки. Последняя страница пустая. Заголовок: «а я»."),
], undefined, { effects: [{ type: "item", id: "saitama-notes" }, { type: "flag", key: "secret:maxim" }] });

chain("item-2027", [
  n("narrator", "Стикер закрывает талон к окулисту. Дата прошла. На обороте чужим почерком: «Полина не сестра. Сестру не надо. Хватит»."),
], undefined, { effects: [{ type: "item", id: "year-2027" }, { type: "flag", key: "secret:evgeniy" }] });

chain("item-circus", [
  n("narrator", "Два билета в цирк. Один целый — «Константин». Второй надорван: «Алексей». Скотчем склеен криво, как шутка, которая уже не смешная."),
], undefined, { effects: [{ type: "item", id: "circus-ticket" }, { type: "flag", key: "secret:clowns" }] });

chain("item-phone", [
  n("narrator", "Телефон без пароля. Чат без имени и без аватара. Заголовок, который Ернур поставил сам: «не открывать»."),
  n("narrator", "Сообщения только с его стороны. Все более короткие. Последнее: «я знаю, что нельзя. я просто»."),
  n("nastya", "Это не любовь. Это яма."),
], undefined, { effects: [{ type: "item", id: "dead-phone" }, { type: "flag", key: "secret:yernur" }] });

chain("item-quotes", [
  n("narrator", "Цитатник Ильи. Чужие фразы, даты, ники. Последняя страница: «моё:» — и пустота, как незаполненный слот в чате."),
], undefined, { effects: [{ type: "item", id: "quote-book" }, { type: "flag", key: "secret:ilya" }] });

/* ---------- KUVANOV ---------- */
add({
  id: "talk:kuvanov",
  lines: [n("kuvanov", "Админ на месте. Вопросы по регламенту, не по Флаттершай — хотя по Флаттершай тоже можно.")],
  choices: [
    { text: "Как я сюда попала?", next: "kuvanov-how" },
    { text: "Ты правда фанат пони?", next: "kuvanov-pony" },
    { text: "Поговорить по-настоящему", next: "kuvanov-deep", require: ["secret:kuvanov"] },
    { text: "Помочь ему", next: "kuvanov-help", require: ["secret:kuvanov", "trust:kuvanov"] },
    { text: "Отойти", next: "kuvanov-bye" },
  ],
});
chain("kuvanov-how", [
  n("kuvanov", "Ты открыла беседу. Беседа открыла тебя. Я только подтвердил заявку."),
  n("nastya", "Это не смешно."),
  n("kuvanov", "Админу не обязательно быть смешным. Админу надо, чтобы чат не развалился."),
], undefined, { effects: [{ type: "flag", key: "met:kuvanov" }, { type: "trust", id: "kuvanov", delta: 1 }] });
chain("kuvanov-pony", [
  n("kuvanov", "Флаттершай не «пони». Флаттершай — это когда ты тихий, и тебя всё равно не едят. Я бы хотел так."),
  n("nastya", "А фурри?"),
  n("kuvanov", "А что фурри. Люди злые. Звери в худи — нет. Не начинай."),
], undefined, { effects: [{ type: "trust", id: "kuvanov", delta: 1 }] });
add({
  id: "kuvanov-deep",
  lines: [
    n("nastya", "На стикере написано, что если кикнешь меня — останешься один."),
    n("kuvanov", "…ты читаешь чужие стикеры. Классика."),
    n("kuvanov", "Спойлерная — это не чат. Это единственное место, где меня не выключили. Если все уйдут, я админ пустой комнаты."),
  ],
  choices: [
    { text: "Ты держишь их в заложниках", next: "kuvanov-hostage" },
    { text: "Страшно быть одному. Но это не повод запирать людей", next: "kuvanov-kind" },
  ],
});
chain("kuvanov-hostage", [
  n("kuvanov", "Красивое слово для «я не умею прощаться»."),
  n("nastya", "Научись. Флаттершай бы не строила клетку."),
], undefined, { effects: [{ type: "trust", id: "kuvanov", delta: 1 }] });
chain("kuvanov-kind", [
  n("kuvanov", "…ладно. Не делай такое лицо. Я не злодей. Я просто очень плохой хозяин вечеринки."),
], undefined, { effects: [{ type: "trust", id: "kuvanov", delta: 2 }] });
add({
  id: "kuvanov-help",
  lines: [
    n("nastya", "Отпусти чат. Не удаляй. Просто перестань быть дверью без ручки."),
    n("kuvanov", "Если я отпущу — они разбегутся и будут писать в личку гадости."),
    n("nastya", "Может быть. А может, кто-то скажет спасибо, что ты был. Это уже не твоя сетка."),
  ],
  choices: [
    { text: "Снять с себя админку. Хотя бы внутри", next: "kuvanov-helped" },
    { text: "Тогда сиди. Я найду другую дверь", next: "kuvanov-fail" },
  ],
});
add({
  id: "kuvanov-helped",
  lines: [
    n("kuvanov", "…хорошо. Не кикну. И дверь потом открою. Если ты всех соберёшь. Флаттершай бы гордилась. Наверное."),
    n("nastya", "Гордилась бы тем, что ты не стал тираном в худи."),
  ],
  effects: [{ type: "help", id: "kuvanov" }, { type: "trust", id: "kuvanov", delta: 2 }],
});
chain("kuvanov-fail", [n("kuvanov", "Админ всегда прав. Даже когда нет.")], undefined, { effects: [{ type: "hurt", id: "kuvanov" }] });
chain("kuvanov-bye", [n("kuvanov", "Не ломай мебель. Она чужая. То есть моя. То есть чата.")]);

/* ---------- ALDIYAR ---------- */
add({
  id: "talk:aldiyar",
  lines: [n("aldiyar", "Ты. Новый слот. Не мешай, я свожу Наруто с Луффи в полуфинале. И да, сенен — это не «мультик».")],
  choices: [
    { text: "Кто сильнее?", next: "aldiyar-vs" },
    { text: "Зачем тебе турнир?", next: "aldiyar-why" },
    { text: "Про сетку, где я «???»", next: "aldiyar-deep", require: ["secret:aldiyar"] },
    { text: "Помочь", next: "aldiyar-help", require: ["secret:aldiyar", "trust:aldiyar"] },
    { text: "Уйти, пока не нагрубил", next: "aldiyar-bye" },
  ],
});
chain("aldiyar-vs", [
  n("aldiyar", "Зависит от условий. Без условий спорят только Максим и клоуны. Они идиоты. Почти как ты, если сейчас скажешь «Гоку»."),
  n("nastya", "А если скажу, что турнир — отмазка?"),
  n("aldiyar", "Тогда ты хотя бы интересная."),
], undefined, { effects: [{ type: "flag", key: "met:aldiyar" }, { type: "trust", id: "aldiyar", delta: 1 }] });
chain("aldiyar-why", [
  n("aldiyar", "Потому что в сетке всё честно. В жизни — нет. Я не «Ямато». Я просто смотрю, как сильные бьются, и делаю вид, что это я."),
  n("nastya", "Жестоко. И очень по-сёненному."),
  n("aldiyar", "Не подлизывайся. Но да."),
], undefined, { effects: [{ type: "trust", id: "aldiyar", delta: 1 }] });
add({
  id: "aldiyar-deep",
  lines: [
    n("nastya", "Ты вписал меня внизу. И себя — «не в топе»."),
    n("aldiyar", "Все вписывают себя на первое место. Я хотя бы честный."),
    n("aldiyar", "Если я не в топе, то зачем я вообще в чате. Зачем я в этом доме. Зачем я."),
  ],
  choices: [
    { text: "Турнир не обязан включать тебя", next: "aldiyar-out" },
    { text: "Ты уже герой своей сёнен-серии. Просто арка длинная", next: "aldiyar-shonen" },
  ],
});
chain("aldiyar-out", [
  n("aldiyar", "Легко сказать той, кто не меряет день «победил/проиграл»."),
], undefined, { effects: [{ type: "trust", id: "aldiyar", delta: 1 }] });
chain("aldiyar-shonen", [
  n("aldiyar", "…это была почти добрая фраза. Не повторяй. Испортишь репутацию."),
], undefined, { effects: [{ type: "trust", id: "aldiyar", delta: 2 }] });
add({
  id: "aldiyar-help",
  lines: [
    n("nastya", "Оставь турнир. Вынь из него живых людей. Особенно себя."),
    n("aldiyar", "Тогда что останется? Аниме? Я и так его смотрю пачками."),
    n("nastya", "Останется Алдияр, который орёт про сенен и иногда бывает прав. Этого хватит."),
  ],
  choices: [
    { text: "Сжечь сетку. Нарисовать новую — без людей", next: "aldiyar-helped" },
    { text: "Ладно, спорь дальше", next: "aldiyar-fail" },
  ],
});
add({
  id: "aldiyar-helped",
  lines: [
    n("aldiyar", "Ладно. Но Максиму я всё равно докажу, что без условий его Сайтама — gag. Это хобби. Не религия."),
    n("nastya", "Вот. Уже человек, не слот."),
  ],
  effects: [{ type: "help", id: "aldiyar" }],
});
chain("aldiyar-fail", [n("aldiyar", "Слабая арка. Перезапуск.")], undefined, { effects: [{ type: "hurt", id: "aldiyar" }] });
chain("aldiyar-bye", [n("aldiyar", "Не спойлери финал. Его нет.")]);

/* ---------- ABIYUKOV ---------- */
add({
  id: "talk:abiyukov",
  lines: [n("abiyukov", "Ну. Живая. Я думал, Куванов опять бота добавил. Ты хотя бы калибруешь, или так, смотришь?")],
  choices: [
    { text: "Ты всегда такой милый?", next: "abi-rude" },
    { text: "Про Доту и Лелуша", next: "abi-dota" },
    { text: "Про список ромкомов", next: "abi-deep", require: ["secret:abiyukov"] },
    { text: "Помочь", next: "abi-help", require: ["secret:abiyukov", "trust:abiyukov"] },
    { text: "Не сегодня", next: "abi-bye" },
  ],
});
chain("abi-rude", [
  n("abiyukov", "Милый — это для ромкомов. В чате милых съедают. Я предпочитаю быть тем, кто шутит первым."),
  n("nastya", "Это не шутка, это броня."),
  n("abiyukov", "Ой, психолог приехала. У нас уже есть Евгений, он тоже всё объясняет и ничего не лечит."),
], undefined, { effects: [{ type: "flag", key: "met:abiyukov" }, { type: "trust", id: "abiyukov", delta: 1 }] });
chain("abi-dota", [
  n("abiyukov", "Дота — это когда ты виноват, даже если не виноват. Как жизнь, только с таймером. Лелуш хотя бы план имел. У Эла — хотя бы мозг. У меня — ммр и рот."),
  n("nastya", "И ромкомы."),
  n("abiyukov", "Ромкомы — это читы. Там людям можно быть тёплыми. Не рассказывай Максиму, он решит, что это дебафф."),
], undefined, { effects: [{ type: "trust", id: "abiyukov", delta: 1 }] });
add({
  id: "abi-deep",
  lines: [
    n("nastya", "«Если бы я умел так». Это про чат или про тебя?"),
    n("abiyukov", "Про то, что я умею только «ну ты и клоун». А сказать «мне одиноко» — это уже фид. Меня за это в чате распнут. Или хуже — пожалеют."),
  ],
  choices: [
    { text: "Можно быть резким и не быть жестоким", next: "abi-soft" },
    { text: "Тебе просто нравится делать больно", next: "abi-cut" },
  ],
});
chain("abi-soft", [
  n("abiyukov", "…скилл-шок. Ладно. Не привыкай."),
], undefined, { effects: [{ type: "trust", id: "abiyukov", delta: 2 }] });
chain("abi-cut", [
  n("abiyukov", "Иногда. Иногда это единственная кнопка, которая нажимается."),
], undefined, { effects: [{ type: "trust", id: "abiyukov", delta: 1 }] });
add({
  id: "abi-help",
  lines: [
    n("nastya", "Давай так: ты шутишь. Но без чужой глотки. Один вечер."),
    n("abiyukov", "Это как играть без вард. Страшно."),
    n("nastya", "Ромком. Ты знаешь правила: никто не умирает от того, что сказал правду."),
  ],
  choices: [
    { text: "Скажи вслух, что тебе одиноко", next: "abi-helped" },
    { text: "Не могу с тобой", next: "abi-fail" },
  ],
});
add({
  id: "abi-helped",
  lines: [
    n("abiyukov", "Мне одиноко. Всё. Титры. Похвалы не надо, я сейчас сдохну от сквозняка."),
    n("nastya", "Нормально сказал. Даже без Лелуша."),
    n("abiyukov", "Лелуш бы сказал лучше. Но ладно."),
  ],
  effects: [{ type: "help", id: "abiyukov" }],
});
chain("abi-fail", [n("abiyukov", "Ну и иди. Калибровка без тебя."), n("ilya", "«Ну и иди», — как сказал Абиюков.")], undefined, { effects: [{ type: "hurt", id: "abiyukov" }] });
chain("abi-bye", [n("abiyukov", "Не стой в дыме. Это метафора. И кухня.")]);

/* ---------- MAXIM ---------- */
add({
  id: "talk:maxim",
  lines: [n("maxim", "Стой. Прежде чем здороваться: Сайтама соло Гоку. Если не согласна — это не разговор, это дебафф интеллекта.")],
  choices: [
    { text: "Сайтама — пародия, не линейка", next: "max-joke" },
    { text: "Ок, соло. И что?", next: "max-ok" },
    { text: "Про пустую страницу «а я»", next: "max-deep", require: ["secret:maxim"] },
    { text: "Помочь", next: "max-help", require: ["secret:maxim", "trust:maxim"] },
    { text: "Отойти от динозавра", next: "max-bye" },
  ],
});
chain("max-joke", [
  n("maxim", "Пародия, которая бьёт всех. Это и есть соло. Клоуны хотя бы понимают. Алдияр — нет, он в условиях."),
  n("nastya", "Ты споришь часами, чтобы не спрашивать, кто ты без спора."),
  n("maxim", "Психология — это не скала. Скала — это персонажи."),
], undefined, { effects: [{ type: "flag", key: "met:maxim" }, { type: "trust", id: "maxim", delta: 1 }] });
chain("max-ok", [
  n("maxim", "Наконец-то. Куванов бы начал про пони. Абиюков — про ммр. Ты нормальная. Почти."),
], undefined, { effects: [{ type: "flag", key: "met:maxim" }, { type: "trust", id: "maxim", delta: 1 }] });
add({
  id: "max-deep",
  lines: [
    n("nastya", "В тетради последняя страница пустая. «А я»."),
    n("maxim", "Это черновик. Не смотри."),
    n("maxim", "Ладно. Смотри. Если Сайтама не сильнейший — тогда я просто человек в костюме ящера, который орёт в чат. Это слабо."),
  ],
  choices: [
    { text: "Слабо — это путать себя с гаг-персонажем", next: "max-gag" },
    { text: "Ты не обязан соло", next: "max-not" },
  ],
});
chain("max-gag", [n("maxim", "…больно. Точно.")], undefined, { effects: [{ type: "trust", id: "maxim", delta: 2 }] });
chain("max-not", [n("maxim", "В «Ванпанчмене» как раз про это. Я знаю. Я просто не применяю канон к себе.")], undefined, { effects: [{ type: "trust", id: "maxim", delta: 1 }] });
add({
  id: "max-help",
  lines: [
    n("nastya", "Закрой тетрадь. Оставь Сайтаму героем. Себе оставь рот и хвост."),
    n("maxim", "Тогда с кем спорить?"),
    n("nastya", "С Алдияром. Для веселья. Не для того, чтобы существовать."),
  ],
  choices: [
    { text: "Напиши на пустой странице своё имя", next: "max-helped" },
    { text: "Не трогай его веру", next: "max-fail" },
  ],
});
add({
  id: "max-helped",
  lines: [
    n("maxim", "Максим. Без соло. Пока держится. Если клоуны начнут — я всё равно отвечу. Но тише."),
  ],
  effects: [{ type: "help", id: "maxim" }],
});
chain("max-fail", [n("maxim", "Ну вот. Ещё один, кто не в скале.")], undefined, { effects: [{ type: "hurt", id: "maxim" }] });
chain("max-bye", [n("maxim", "Гоку не соло. Помни.")]);

/* ---------- EVGENIY ---------- */
add({
  id: "talk:evgeniy",
  lines: [n("evgeniy", "О, живой человек. Нет, подожди. Может, симуляция. Ладно. Какой у тебя жим лёжа? И ты знаешь, что в 2027 всё другое будет?")],
  choices: [
    { text: "Жим? Серьёзно?", next: "evg-bench" },
    { text: "Боишься ослепнуть", next: "evg-eyes" },
    { text: "Про талон и записку", next: "evg-deep", require: ["secret:evgeniy"] },
    { text: "Помочь", next: "evg-help", require: ["secret:evgeniy", "trust:evgeniy"] },
    { text: "Отойти от нейросети", next: "evg-bye" },
  ],
});
chain("evg-bench", [
  n("evgeniy", "Жим — это понятная цифра. Всё остальное — нет. Роботы, сетки, Полина, сестра, глаза. Цифра проще."),
  n("nastya", "Ты прячешься в цифре."),
  n("evgeniy", "А ты — в этом доме. Не кидайся камнями, у нас и так ИИ кидается."),
], undefined, { effects: [{ type: "flag", key: "met:evgeniy" }, { type: "trust", id: "evgeniy", delta: 1 }] });
chain("evg-eyes", [
  n("evgeniy", "Если я ослепну — не увижу ни модели, ни Полину, ни… ладно. Врач сказал «прийти». Я поставил стикер сверху. 2027 всё спишет."),
  n("nastya", "2027 не придёт вместо тебя на приём."),
], undefined, { effects: [{ type: "trust", id: "evgeniy", delta: 1 }] });
add({
  id: "evg-deep",
  lines: [
    n("nastya", "На обороте талона чужой почерк: «Полина не сестра. Сестру не надо»."),
    n("evgeniy", "Это не чужой. Это я, когда был честнее."),
    n("evgeniy", "Полина — отдельная история. Обычная, глупая, живая. А сестра… я знаю, что так нельзя. Я не романтизирую. Я путаюсь и ненавижу, что путаюсь. Это поломка, не «любовь»."),
  ],
  choices: [
    { text: "Назови это поломкой вслух и не переступай черту", next: "evg-bound" },
    { text: "Мне противно. Но я не уйду, если ты не врёшь себе", next: "evg-disgust" },
  ],
});
chain("evg-bound", [
  n("evgeniy", "Поломка. Да. Полину можно… пытаться. Сестру — нет. Никогда. Я это знал. Стикер был, чтобы забыть, что знал."),
], undefined, { effects: [{ type: "trust", id: "evgeniy", delta: 2 }] });
chain("evg-disgust", [
  n("evgeniy", "Справедливо. Останься, только если будешь злой. Мне нужна злость, не нежность. Нежность здесь путает."),
], undefined, { effects: [{ type: "trust", id: "evgeniy", delta: 1 }] });
add({
  id: "evg-help",
  lines: [
    n("nastya", "Снимаем стикер. Идёшь к врачу. 2027 подождёт. Сестра — граница. Полина — если она живой человек, а не аватар в голове."),
    n("evgeniy", "А жим?"),
    n("nastya", "Можешь спрашивать. Но не вместо жизни."),
  ],
  choices: [
    { text: "Снять стикер вместе", next: "evg-helped" },
    { text: "Сам разберёшься. Или нет", next: "evg-fail" },
  ],
});
add({
  id: "evg-helped",
  lines: [
    n("evgeniy", "Снял. Глаза ещё видят тебя. Это уже аргумент против 2027."),
    n("nastya", "Держись за это. Не за сестру."),
    n("evgeniy", "Держусь. Стыдно. Это правильный стыд."),
  ],
  effects: [{ type: "help", id: "evgeniy" }],
});
chain("evg-fail", [n("evgeniy", "Тогда модель досчитает без тебя.")], undefined, { effects: [{ type: "hurt", id: "evgeniy" }] });
chain("evg-bye", [n("evgeniy", "Если ослепну — напиши в чат. Шутка. Плохая.")]);

/* ---------- CLOWNS ---------- */
add({
  id: "talk:kostya",
  lines: [n("kostya", "Билеты, пожалуйста. Шутка. Мы уже внутри. Я Константин, старший. Это не грим. Это я.")],
  choices: [
    { text: "Сайтама соло Гоку, да?", next: "ko-saitama" },
    { text: "Зачем вам клоунада", next: "ko-why" },
    { text: "Про надорванный билет", next: "ko-deep", require: ["secret:clowns"] },
    { text: "Помочь братьям", next: "ko-help", require: ["secret:clowns", "trust:kostya"] },
    { text: "Уйти из цирка", next: "ko-bye" },
  ],
});
chain("ko-saitama", [
  n("kostya", "Сайтама соло. Это наш семейный конёк. Алдияр бесится — значит, работает."),
  n("lesha", "Костя, скажи ей про Майнкрафт!"),
  n("kostya", "Потом. Сначала зритель должен посмеяться. Или испугаться. Нам всё равно."),
], undefined, { effects: [{ type: "flag", key: "met:kostya" }, { type: "flag", key: "met:lesha" }, { type: "trust", id: "kostya", delta: 1 }] });
chain("ko-why", [
  n("kostya", "Потому что «брату плохо» — это не стендап. А «клоуну плохо» — это номер. Номер можно закончить. Брата — нет."),
], undefined, { effects: [{ type: "trust", id: "kostya", delta: 1 }] });
add({
  id: "ko-deep",
  lines: [
    n("nastya", "Билет Лёши надорван. Твой целый."),
    n("kostya", "Он хотел выйти из номера. Я сказал, что без грима нас не будет. Это ложь. Без грима будет просто Костя и Лёша. Страшнее номера."),
  ],
  choices: [
    { text: "Ты его не защищаешь. Ты его прячешь", next: "ko-hide" },
    { text: "Можно быть братьями без аншлага", next: "ko-bro" },
  ],
});
chain("ko-hide", [n("kostya", "Сарказм закончился. Да. Прячу.")], undefined, { effects: [{ type: "trust", id: "kostya", delta: 2 }, { type: "trust", id: "lesha", delta: 1 }] });
chain("ko-bro", [n("kostya", "Майнкрафт мы и так вместе. Там нет зрителей. Там только криперы.")], undefined, { effects: [{ type: "trust", id: "kostya", delta: 1 }, { type: "trust", id: "lesha", delta: 1 }] });
add({
  id: "ko-help",
  lines: [
    n("nastya", "Снимите номер. Хотя бы на одну ночь. Поговорите как Костя и Лёша."),
    n("kostya", "А если тишина?"),
    n("lesha", "Тогда я скажу первым. Я умею. Просто ты всегда громче."),
  ],
  choices: [
    { text: "Пусть Лёша скажет первым", next: "ko-helped" },
    { text: "Не ломайте номер", next: "ko-fail" },
  ],
});
add({
  id: "ko-helped",
  lines: [
    n("lesha", "Костя, я устал быть панчлайном."),
    n("kostya", "…слышал. Не смеюсь. Это новое. Сайтама всё равно соло. Но мы — нет. Мы двое."),
  ],
  effects: [{ type: "help", id: "kostya" }, { type: "help", id: "lesha" }],
});
chain("ko-fail", [n("kostya", "Антракт отменяется. Хлопайте.")], undefined, { effects: [{ type: "hurt", id: "kostya" }, { type: "hurt", id: "lesha" }] });
chain("ko-bye", [n("kostya", "Не подсказывай Гоку. Ему не поможет.")]);

add({
  id: "talk:lesha",
  lines: [n("lesha", "Я младший. Если Костя орёт — я орёт. Если нет — я тоже могу, просто тише. Хочешь Майнкрафт?")],
  choices: [
    { text: "Хочу услышать тебя, не эхо", next: "le-echo" },
    { text: "Говорить с Костей", next: "talk:kostya" },
    { text: "Про билет", next: "ko-deep", require: ["secret:clowns"] },
    { text: "Помочь", next: "ko-help", require: ["secret:clowns", "trust:kostya"] },
    { text: "Пока", next: "le-bye" },
  ],
});
chain("le-echo", [
  n("lesha", "Эхо тоже человек. Просто его всегда ставят вторым в нике: «Чигаревы»."),
  n("nastya", "Тогда скажи что-нибудь, чего Костя не скажет."),
  n("lesha", "Мне иногда не смешно. Всё."),
], undefined, { effects: [{ type: "flag", key: "met:lesha" }, { type: "trust", id: "lesha", delta: 1 }, { type: "trust", id: "kostya", delta: 1 }] });
chain("le-bye", [n("lesha", "Если найдёшь алмазы — это к нам.")]);

/* ---------- YERNUR ---------- */
add({
  id: "talk:yernur",
  lines: [n("yernur", "Не смотри так. Я не Итачи. Я Бекболат, которого чат уже похоронил. Смысл потерян. Можно не здороваться.")],
  choices: [
    { text: "Почему смысл потерян?", next: "ye-why" },
    { text: "Чат травит — или ты сам?", next: "ye-chat" },
    { text: "Про телефон «не открывать»", next: "ye-deep", require: ["secret:yernur"] },
    { text: "Помочь вылезти", next: "ye-help", require: ["secret:yernur", "trust:yernur"] },
    { text: "Дать ему тишину", next: "ye-bye" },
  ],
});
chain("ye-why", [
  n("yernur", "Потому что я придумал человека в наушниках и решил, что это судьба. Аниме хотя бы заканчивается. Это — нет."),
  n("nastya", "Судьба не живёт в личке."),
  n("yernur", "Знаю. Знание не лечит. Оно ноет."),
], undefined, { effects: [{ type: "flag", key: "met:yernur" }, { type: "trust", id: "yernur", delta: 1 }] });
chain("ye-chat", [
  n("yernur", "Чат ржёт. Я ржу вместе, чтобы не было видно. Потом пишу туда, куда писать нельзя. Потом ненавижу себя. Потом аниме. Круг."),
], undefined, { effects: [{ type: "trust", id: "yernur", delta: 1 }] });
add({
  id: "ye-deep",
  lines: [
    n("nastya", "Я видела телефон. Чат без имени. Только ты. Ты сам написал «не открывать»."),
    n("yernur", "Потому что открывать — это продолжать. Там человек, которому нельзя писать. Не «малышка из сюжета». Живой. И я уже перешёл черту тем, что цепляюсь."),
    n("yernur", "Это не роман. Это яма. Я знаю. Я всё равно ною. Вот и весь Бекболат."),
  ],
  choices: [
    { text: "Это надо остановить. Не утешать", next: "ye-stop" },
    { text: "Ты чудовище", next: "ye-monster" },
  ],
});
chain("ye-stop", [
  n("nastya", "Не «она». Не фантазия. Ты. Твоя голова. Выключи это. Не геройски — стыдно и правильно."),
  n("yernur", "Стыдно я умею. Правильно — нет. Научи, раз попала."),
], undefined, { effects: [{ type: "trust", id: "yernur", delta: 2 }] });
chain("ye-monster", [
  n("yernur", "Да. И всё равно сижу. Если ты только для приговора — он у меня уже есть."),
], undefined, { effects: [{ type: "trust", id: "yernur", delta: 1 }] });
add({
  id: "ye-help",
  lines: [
    n("nastya", "Удаляешь чат. Не «потом». Сейчас. Потом — живые люди, аниме, что угодно, только не это."),
    n("yernur", "Если удалю — что останется?"),
    n("nastya", "Ты. Пустой. Это лучше, чем ты, который делает хуже."),
  ],
  choices: [
    { text: "Удалить вместе. Не смотреть историю", next: "ye-helped" },
    { text: "Оставить ему яму", next: "ye-fail" },
  ],
});
add({
  id: "ye-helped",
  lines: [
    n("yernur", "Удалил. Руки трясутся. Смысл не вернулся. Но ямы меньше. На сегодня хватит."),
    n("nastya", "Этого достаточно, чтобы не быть злодеем своей же ночи."),
  ],
  effects: [{ type: "help", id: "yernur" }],
});
chain("ye-fail", [n("yernur", "Тогда не стой рядом. Ты пахнешь выходом.")], undefined, { effects: [{ type: "hurt", id: "yernur" }] });
chain("ye-bye", [n("yernur", "Если услышишь, как я ною — не подпевай.")]);

/* ---------- ILYA ---------- */
add({
  id: "talk:ilya",
  lines: [n("ilya", "«О. Новая», — как сказал Куванов. «Не мешай», — как сказал Алдияр. Привет. Я Илья. Наверное.")],
  choices: [
    { text: "Скажи что-нибудь своё", next: "il-own" },
    { text: "Зачем цитаты?", next: "il-why" },
    { text: "Про пустую страницу", next: "il-deep", require: ["secret:ilya"] },
    { text: "Помочь", next: "il-help", require: ["secret:ilya", "trust:ilya"] },
    { text: "Пока", next: "il-bye" },
  ],
});
chain("il-own", [
  n("ilya", "…"),
  n("ilya", "Космос."),
  n("nastya", "Подойдёт."),
  n("ilya", "Я кот. Иногда. Так проще, чем «я не знаю, кто говорит»."),
], undefined, { effects: [{ type: "flag", key: "met:ilya" }, { type: "trust", id: "ilya", delta: 1 }] });
chain("il-why", [
  n("ilya", "Если я цитирую, меня нельзя обидеть. Обижают авторов. Авторов много. Я — репост."),
], undefined, { effects: [{ type: "trust", id: "ilya", delta: 1 }] });
add({
  id: "il-deep",
  lines: [
    n("nastya", "В цитатнике страница «моё:» пустая."),
    n("ilya", "Потому что если я напишу своё, чат скажет, что это уже было. Или что это глупо. Или что это не я."),
  ],
  choices: [
    { text: "Напиши одно предложение. Глупое можно", next: "il-write" },
    { text: "Репост тоже кто-то читает", next: "il-repost" },
  ],
});
chain("il-write", [n("ilya", "Хорошо. Потом. Нет. Сейчас. Ладно.")], undefined, { effects: [{ type: "trust", id: "ilya", delta: 2 }] });
chain("il-repost", [n("ilya", "Ты только что процитировала доброту. Я запишу.")], undefined, { effects: [{ type: "trust", id: "ilya", delta: 1 }] });
add({
  id: "il-help",
  lines: [
    n("nastya", "Одно своё. Не чужое. Я подожду."),
    n("ilya", "Мне страшно, что дом исчезнет, если я перестану быть эхом."),
    n("nastya", "Дом держится на людях, не на копипасте."),
  ],
  choices: [
    { text: "Слушаю", next: "il-helped" },
    { text: "Не мучай его", next: "il-fail" },
  ],
});
add({
  id: "il-helped",
  lines: [
    n("ilya", "Мне нравится, когда Настя ходит по дому и не орёт. Это моё. Не Куванова. Не Алдияра. Моё."),
    n("nastya", "Записывай."),
  ],
  effects: [{ type: "help", id: "ilya" }],
});
chain("il-fail", [n("ilya", "«Не мучай его», — как сказала Настя. Я так и сделаю.")], undefined, { effects: [{ type: "hurt", id: "ilya" }] });
chain("il-bye", [n("ilya", "«Пока», — как сказала ты. И я.")]);

/* ---------- crisis / house ---------- */
add({
  id: "crisis-start",
  lines: [
    n("house", "Все говорят сразу. Это и есть Спойлерная."),
    n("kuvanov", "Не кикай ночь."),
    n("aldiyar", "Ночь не в топе."),
    n("maxim", "Ночь соло."),
    n("abiyukov", "Ночь фидит."),
    n("evgeniy", "2027."),
    n("kostya", "Антракт."),
    n("yernur", "Не открывать."),
    n("ilya", "«Не открывать»."),
    n("nastya", "Хватит. Я вас слышала. По одному."),
  ],
  effects: [{ type: "flag", key: "crisis-seen" }],
});

add({
  id: "house-talk",
  lines: [
    n("house", "Я — беседа. Я ем незакрытые вкладки. Если ты уйдёшь, не назвав их по именам, я оставлю тебе уведомление на всю жизнь."),
  ],
  choices: [
    { text: "Я их видела", next: "house-true", require: ["true-ready"] },
    { text: "Я просто хочу выйти", next: "house-leave" },
  ],
});
add({
  id: "house-true",
  lines: [
    n("house", "Тогда я могу быть просто квартирой. Утром. С посудой. Без соло."),
    n("nastya", "Пойдёт."),
  ],
  effects: [{ type: "ending", id: "true" }],
});
chain("house-leave", [n("house", "Можно. Но я умею пинговать.")]);

export const DIALOGUE: Record<string, DialogueNode> = Object.fromEntries(nodes.map((x) => [x.id, x]));

export function getTalkRoot(id: CharacterId): string {
  if (id === "kostya") return "talk:kostya";
  if (id === "lesha") return "talk:lesha";
  return `talk:${id}`;
}
